import type { UpdateService } from "~/ergoapi/UpdateService";
import { PollUpdateService } from "~/ergoapi/PollUpdateService";
import { ReplayUpdateService } from "~/ergoapi/ReplayUpdateService";

import type { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { DefaultAssembleStrategy } from "~/assemble/DefaultAssembleStrategy";

import { AssemblySnapshot, TxStateSet } from "./state-snapshot";
import type { AcceptsCommands } from "./Command";
import { UnconfirmedTransactionsTick } from "./UnconfirmedTransactionsTick";
import { Tick } from "./Tick";
import { BlockFoundTick } from "./BlockFoundTick";
import { SkipTick } from "./SkipTick";
import { delay } from "~/common/utils";
import { watchUpdates } from "./watch-updates";
import { Transaction } from "~/common/types";

export class Engine {
  private assembly: AssemblySnapshot;
  private assembleStrategy: AssembleStrategy;

  private cmdExecutor: AcceptsCommands;
  private isIdle: boolean;
  private isPaused: boolean;

  private updateService: UpdateService;

  constructor(cmdExecutor: AcceptsCommands) {
    // Starts with empty assembly
    this.assembly = new AssemblySnapshot([], new TxStateSet());
    this.assembleStrategy = new DefaultAssembleStrategy();

    this.cmdExecutor = cmdExecutor;
    this.isIdle = true;
    this.isPaused = false;

    // this.updateService = new PollUpdateService();
    this.updateService = new ReplayUpdateService("/replays/replay-01.json");

    (<any>window).e = this;
    let w = ((<any>window).w = watchUpdates(this.updateService));

    this.startListening();
  }

  public getUpdateService() {
    return this.updateService;
  }

  public startListening() {
    this.updateService.start();
  }

  public stopListening() {
    this.updateService.stop();
  }

  public pause() {
    this.stopListening();
    this.isPaused = true;
  }

  public resume() {
    this.startListening();
    this.isPaused = false;
  }

  public getPlacement(tx: Transaction) {
    return this.assembly.states.getState(tx)?.placement ?? null;
  }

  private createNextTick(): Tick {
    let nextUpdate = this.updateService.getNextUpdate();

    switch (nextUpdate.type) {
      case "txs":
        return new UnconfirmedTransactionsTick(
          this.assembly,
          this.assembleStrategy,
          nextUpdate.transactions
        );

      case "block":
        // return new SkipTick(this.assembly, this.assembleStrategy);
        return new BlockFoundTick(
          this.assembly,
          this.assembleStrategy,
          nextUpdate.block
        );
    }
  }

  public update() {
    if (
      !this.isPaused &&
      this.isIdle &&
      this.updateService.hasUpdatesInQueue()
    ) {
      this.isIdle = false;

      let tick = this.createNextTick();
      let targetAssembly = tick.getNextAssembly();

      tick
        .applyCommands(this.cmdExecutor)
        .then(() => delay(0))
        .then(() => {
          this.assembly = targetAssembly;
          this.isIdle = true;
        });
    }
  }
}
