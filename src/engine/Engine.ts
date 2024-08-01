import { delay } from "~/common/utils";
import type { AcceptsCommands, Command } from "~/common/Command";
import type { UpdateService } from "~/ergoapi/UpdateService";

import type { AssembleStrategy } from "./assemble/AssembleStrategy";
import { DefaultAssembleStrategy } from "./assemble/DefaultAssembleStrategy";

import type { Tick } from "./Tick";
import { Assembly } from "./Assembly";
import { TransactionsTick } from "./TransactionsTick";
import { BlockTick } from "./BlockTick";

export class Engine {
  private currentAssembly: Assembly;
  private assembleStrategy: AssembleStrategy;

  private cmdExecutor: AcceptsCommands;
  private isIdle: boolean;
  private isPaused: boolean;

  private updateService: UpdateService;

  constructor(
    cmdExecutor: AcceptsCommands,
    updateService: UpdateService,
    startUpdates: boolean = true
  ) {
    this.currentAssembly = Assembly.empty();
    this.assembleStrategy = new DefaultAssembleStrategy();

    this.cmdExecutor = cmdExecutor;
    this.isIdle = true;
    this.isPaused = false;

    this.updateService = updateService;

    if (startUpdates) {
      updateService.start();
    }
  }

  public getUpdateService() {
    return this.updateService;
  }

  public pause() {
    this.updateService.stop();
    this.isPaused = true;
  }

  public resume() {
    this.updateService.start();
    this.isPaused = false;
  }

  private createNextTick(): Tick {
    let nextUpdate = this.updateService.getNextUpdate();

    switch (nextUpdate.type) {
      case "txs":
        return new TransactionsTick(
          this.currentAssembly,
          this.assembleStrategy,
          nextUpdate.transactions
        );

      case "block":
        return new BlockTick(
          this.currentAssembly,
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
        .then(() => delay(0) /* For testing purposes */)
        .then(() => {
          this.currentAssembly = targetAssembly;
          this.isIdle = true;
        })
        .catch(() => {
          this.cmdExecutor.reset();

          let commands: Command[] = targetAssembly.transactions.map(tx => ({
            type: "spawn",
            tx,
            at: targetAssembly.placementMap.get(tx.id)
          }));

          // We assume that this call to executeCommands will
          // never throw
          this.cmdExecutor.executeCommands(commands).then(() => {
            this.currentAssembly = targetAssembly;
            this.isIdle = true;
          });
        });
    }
  }

  public destroy() {
    this.updateService.stop();
  }
}
