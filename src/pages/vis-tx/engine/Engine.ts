import type { AcceptsCommands, Command } from "./Command";
import type { UpdateService } from "../updates/UpdateService";

import type { AssembleStrategy } from "./assemble/AssembleStrategy";
import { ValuePriorityStrategy } from "./assemble/ValuePriorityStrategy";

import type { Tick } from "./Tick";
import { Assembly } from "./assemble/Assembly";
import { TransactionsTick } from "./TransactionsTick";
import { BlockTick } from "./BlockTick";
import type { DeepReadonly } from "~/types/utility";
import { AppEmitter } from "~/utils/events";

type EngineEvents = {
  mempool_updated: DeepReadonly<Assembly>;
  block_found: DeepReadonly<Assembly>;
};

export class Engine extends AppEmitter<EngineEvents> {
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
    super();
    this.currentAssembly = Assembly.empty();
    this.assembleStrategy = new ValuePriorityStrategy();

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

      if (tick instanceof TransactionsTick) {
        this.emit("mempool_updated", targetAssembly);
      } else if (tick instanceof BlockTick) {
        this.emit("block_found", targetAssembly);
      }

      tick
        .applyCommands(this.cmdExecutor)
        // .then(() => delay(0) /* For testing purposes */)
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

          // We assume that this call to `executeCommands()` will
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
