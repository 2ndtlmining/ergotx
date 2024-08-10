import type { AcceptsCommands } from "./Command";

import type { Assembly } from "./assemble/Assembly";
import type { AssembleStrategy } from "./assemble/AssembleStrategy";

export abstract class Tick {
  constructor(
    protected readonly assembly: Assembly,
    protected readonly assembleStrategy: AssembleStrategy
  ) {}

  abstract getNextAssembly(): Assembly;
  abstract applyCommands(cmdExecutor: AcceptsCommands): Promise<void>;
}
