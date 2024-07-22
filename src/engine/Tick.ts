import type { AssembleStrategy } from "~/assemble/AssembleStrategy";
import type { AcceptsCommands } from "~/common/Command";
import type { Assembly } from "./Assembly";

export abstract class Tick {
  constructor(
    protected readonly assembly: Assembly,
    protected readonly assembleStrategy: AssembleStrategy
  ) {}

  abstract getNextAssembly(): Assembly;
  abstract applyCommands(cmdExecutor: AcceptsCommands): Promise<void>;
}
