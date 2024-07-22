import { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { PropSet } from "~/common/PropSet";
import { TX_MAX_AGE } from "~/common/constants";
import { Transaction } from "~/common/types";
import { AcceptsCommands, Command } from "./Command";
import { arePlacementsEqual } from "./Placement";
import { AssemblySnapshot, TxStateSet } from "./state-snapshot";
import { Tick } from "./Tick";
import { assembleWith } from "./utils";

export class UnconfirmedTransactionsTick extends Tick {
  private targetAssembly: AssemblySnapshot;

  constructor(
    assembly: AssemblySnapshot,
    assembleStrategy: AssembleStrategy,
    protected readonly incomingTxs: Transaction[]
  ) {
    super(assembly, assembleStrategy);

    let newStates = assembly.states.clone();
    let newTransactions = this.mergeIncomingInto(newStates);
    this.targetAssembly = assembleWith(
      this.assembleStrategy,
      newStates,
      newTransactions
    );
  }

  private mergeIncomingInto(newStates: TxStateSet) {
    // 1. Increment all
    newStates.incrementAll();

    // 2. Append, or reset age, of new
    for (const tx of this.incomingTxs) {
      newStates.markSeen(tx);
    }

    // 3. Remove those with age >= MAX_AGE
    let combinedSet = PropSet.fromArray(
      [...this.assembly.transactions, ...this.incomingTxs],
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

  getNextAssembly(): AssemblySnapshot {
    return this.targetAssembly;
  }

  async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {
    let snapshotA = this.assembly;
    let snapshotB = this.targetAssembly!;

    let combinedSet = PropSet.fromArray(
      [...snapshotA.transactions, ...snapshotB.transactions],
      tx => tx.id
    );

    let lifespans: Command[] = [];
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
        lifespans.push({
          type: "kill",
          tx
        });
      } else if (!aliveBefore && aliveNow) {
        // First spawn
        lifespans.push({
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

    if (lifespans.length > 0) await cmdExecutor.executeCommands(lifespans);

    if (walks.length > 0) await cmdExecutor.executeCommands(walks);
  }
}
