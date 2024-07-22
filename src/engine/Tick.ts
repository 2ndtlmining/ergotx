import { AssembleStrategy } from "~/assemble/AssembleStrategy";

import { AcceptsCommands } from "./Command";
import { Assembly } from "./machine2/Assembly";

export abstract class Tick {
  constructor(
    protected readonly assembly: Assembly,
    protected readonly assembleStrategy: AssembleStrategy
  ) {}

  abstract getNextAssembly(): Assembly;
  abstract applyCommands(cmdExecutor: AcceptsCommands): Promise<void>;
}
