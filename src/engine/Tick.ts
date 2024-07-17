import { AssembleStrategy } from "~/assemble/AssembleStrategy";

import { AcceptsCommands } from "./Command";
import { AssemblySnapshot } from "./state-snapshot";

export abstract class Tick {
  constructor(
    protected readonly assembly: AssemblySnapshot,
    protected readonly assembleStrategy: AssembleStrategy
  ) {}

  abstract getNextAssembly(): AssemblySnapshot;
  abstract applyCommands(cmdExecutor: AcceptsCommands): Promise<void>;
}
