import { UpdateService } from "~/ergoapi/UpdateService";
import { TransactedBlock, Transaction } from "~/common/types";
import { Renderer } from "../Renderer";
import { AssemblySnapshot, TxStateSet } from "./snapshot";
import { PropSet } from "~/common/PropSet";
import { AssembleStrategy, DefaultAssembleStrategy } from "../assembly";
import { Command } from "./Command";
import { arePlacementsEqual } from "../Placement";

const TX_MAX_AGE = 4;

type Update =
  | { type: "txs"; transactions: Transaction[] }
  | { type: "block"; block: TransactedBlock };

export class Engine2 {
  private assembly: AssemblySnapshot;
  private targetAssembly: AssemblySnapshot | null;

  private assembleStrategy: AssembleStrategy;

  private renderer: Renderer;
  private isIdle: boolean;

  /* ====== Queuing ====== */
  private updateService: UpdateService;
  private updatesQueue: Update[];

  constructor(renderer: Renderer) {
    // Starts with empty assembly
    this.assembly = new AssemblySnapshot([], new TxStateSet());
    this.targetAssembly = null;

    this.assembleStrategy = new DefaultAssembleStrategy();

    this.renderer = renderer;
    this.isIdle = true;

    this.updateService = new UpdateService();
    this.updatesQueue = [];
  }

  public startListening() {
    this.updateService
      .onUnconfirmedTransactions(txs => {
        this.updatesQueue.push({
          type: "txs",
          transactions: txs
        });
      })
      .onNewBlock(block => {
        this.updatesQueue.push({
          type: "block",
          block
        });
      });
    this.updateService.start();
  }

  /* ================= TX TICK ================= */

  private mergeIncomingTxs(newStates: TxStateSet, incomingTxs: Transaction[]) {
    // increment
    newStates.incrementAll();

    // append new or reset age of new
    for (const tx of incomingTxs) {
      newStates.markSeen(tx);
    }

    // remove with age >= MAX_AGE
    let combinedSet = PropSet.fromArray(
      [...this.assembly.transactions, ...incomingTxs],
      tx => tx.id
    );

    let newTransactions: Transaction[] = [];

    for (const tx of combinedSet.getItems()) {
      let state = newStates.getState(tx)!;
      if (state.age >= TX_MAX_AGE) {
        newStates.remove(tx);
      } else {
        newTransactions.push(tx);
      }
    }

    return newTransactions;
  }

  private assembleTxs(states: TxStateSet, transactions: Transaction[]) {
    let assembled = this.assembleStrategy.assembleTransactions(transactions);
    for (const { tx, placement } of assembled) {
      states.getState(tx)!.placement = placement;
    }
  }

  private async emitTxsCommands() {
    let snapshotA = this.assembly;
    let snapshotB = this.targetAssembly!;

    let combinedSet = PropSet.fromArray(
      [...snapshotA.transactions, ...snapshotB.transactions],
      tx => tx.id
    );

    let spawns: Command[] = [];
    let kills: Command[] = [];
    let walks: Command[] = [];

    for (const tx of combinedSet.getItems()) {
      let placementBefore = snapshotA.states.getState(tx)?.placement ?? null;
      let placementAfter = snapshotB.states.getState(tx)?.placement ?? null;

      let aliveBefore = Boolean(placementBefore);
      let aliveNow = Boolean(placementAfter);

      if (aliveBefore && aliveNow) {
        if (!arePlacementsEqual(placementBefore!, placementAfter!)) {
          walks.push({
            type: "walk",
            tx,
            placement: placementAfter!
          });
        }
      } else if (aliveBefore && !aliveNow) {
        // register destroy move
        kills.push({
          type: "kill",
          tx
        });
      } else if (!aliveBefore && aliveNow) {
        // First spawn
        spawns.push({
          type: "spawn",
          tx
        });

        // and then register 'waiting' or 'block' depending
        // on placement
        walks.push({
          type: "walk",
          tx,
          placement: placementAfter!
        });
      }
    }

    await this.renderer.executeCommands([...spawns, ...kills]);
    await this.renderer.executeCommands(walks);
  }

  private async startTxsTick(incomingTxs: Transaction[]) {
    // Calculate Next assembly
    let newStates = this.assembly.states.clone();

    let newTransactions = this.mergeIncomingTxs(newStates, incomingTxs);
    this.assembleTxs(newStates, newTransactions);

    this.targetAssembly = new AssemblySnapshot(newTransactions, newStates);

    // Commands
    return this.emitTxsCommands();
  }

  private async startBlockTick(block: TransactedBlock) {
    return Promise.resolve();
  }

  public update() {
    if (this.isIdle && this.updatesQueue.length > 0) {
      let nextUpdate = this.updatesQueue.shift()!;
      this.isIdle = false;

      let tickPromise: Promise<void>;

      switch (nextUpdate.type) {
        case "txs":
          tickPromise = this.startTxsTick(nextUpdate.transactions);
          break;

        case "block":
          tickPromise = this.startBlockTick(nextUpdate.block);
          break;
      }

      tickPromise.then(() => {
        if (
          this.targetAssembly !== null &&
          this.targetAssembly !== this.assembly
        ) {
          this.assembly = this.targetAssembly;
        }

        this.targetAssembly = null;
        this.isIdle = true;
      });
    }
  }
}
