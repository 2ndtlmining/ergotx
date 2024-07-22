import type { AcceptsCommands } from "./Command";
import type { Assembly } from "./Assembly";
import { Tick } from "./Tick";

export class SkipTick extends Tick {
  getNextAssembly(): Assembly {
    return this.assembly;
  }

  async applyCommands(_cmdExecutor: AcceptsCommands): Promise<void> {}
}
