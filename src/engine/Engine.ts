import { Transaction } from "~/common/types";
import { delay } from "~/common/utils";

import type { UpdateService } from "~/ergoapi/UpdateService";
import { PollUpdateService } from "~/ergoapi/PollUpdateService";
import { ReplayUpdateService } from "~/ergoapi/ReplayUpdateService";

import type { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { DefaultAssembleStrategy } from "~/assemble/DefaultAssembleStrategy";

import type { AcceptsCommands } from "./Command";
import type { Tick } from "./Tick";
import { TransactionsTick } from "./TransactionsTick";
import { BlockTick } from "./BlockTick";
import { Assembly } from "./Assembly";
import { SkipTick } from "./SkipTick";
import { watchUpdates } from "./watch-updates";

export class Engine {
  private assembly: Assembly;
  private assembleStrategy: AssembleStrategy;

  private cmdExecutor: AcceptsCommands;
  private isIdle: boolean;
  private isPaused: boolean;

  private updateService: UpdateService;

  constructor(cmdExecutor: AcceptsCommands) {
    // Starts with empty assembly
    this.assembly = Assembly.empty();
    this.assembleStrategy = new DefaultAssembleStrategy();

    this.cmdExecutor = cmdExecutor;
    this.isIdle = true;
    this.isPaused = false;

    // this.updateService = new PollUpdateService();
    this.updateService = new ReplayUpdateService("/replays/replay-01.json");
    this.startListening();

    (<any>window).e = this;
    let w = ((<any>window).w = watchUpdates(this.updateService));
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
    return this.assembly.placementMap.get(tx.id);
  }

  private createNextTick(): Tick {
    let nextUpdate = this.updateService.getNextUpdate();

    switch (nextUpdate.type) {
      case "txs":
        return new TransactionsTick(
          this.assembly,
          this.assembleStrategy,
          nextUpdate.transactions
        );

      case "block":
        // return new SkipTick(this.assembly, this.assembleStrategy);
        return new BlockTick(
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
