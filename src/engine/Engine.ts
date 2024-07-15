import { UpdateService } from "~/ergoapi/UpdateService";
import type { TransactedBlock, Transaction } from "~/common/types";

import type { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { DefaultAssembleStrategy } from "~/assemble/DefaultAssembleStrategy";

import { AssemblySnapshot, TxStateSet } from "./state-snapshot";
import type { AcceptsCommands } from "./Command";
import { UnconfirmedTransactionsTick } from "./UnconfirmedTransactionsTick";
import { Tick } from "./Tick";
import { BlockFoundTick } from "./BlockFoundTick";

type Update =
  | { type: "txs"; transactions: Transaction[] }
  | { type: "block"; block: TransactedBlock };

export class Engine {
  private assembly: AssemblySnapshot;
  private assembleStrategy: AssembleStrategy;

  private cmdExecutor: AcceptsCommands;
  private isIdle: boolean;

  /* ====== Queuing ====== */
  private updateService: UpdateService;
  private updatesQueue: Update[];

  constructor(cmdExecutor: AcceptsCommands) {
    // Starts with empty assembly
    this.assembly = new AssemblySnapshot([], new TxStateSet());
    this.assembleStrategy = new DefaultAssembleStrategy();

    this.cmdExecutor = cmdExecutor;
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

  public stopListening() {
    this.updateService.stop();
  }

  private createNextTick(): Tick {
    let nextUpdate = this.updatesQueue.shift()!;

    switch (nextUpdate.type) {
      case "txs":
        return new UnconfirmedTransactionsTick(
          this.assembly,
          this.assembleStrategy,
          nextUpdate.transactions
        );

      case "block":
        return new BlockFoundTick(
          this.assembly,
          this.assembleStrategy,
          nextUpdate.block
        );
    }
  }

  public update() {
    if (this.isIdle && this.updatesQueue.length > 0) {
      this.isIdle = false;

      let tick = this.createNextTick();
      let targetAssembly = tick.getNextAssembly();

      tick.applyCommands(this.cmdExecutor).then(() => {
        this.assembly = targetAssembly;
        this.isIdle = true;
      });
    }
  }
}
