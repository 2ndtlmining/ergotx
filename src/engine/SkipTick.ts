import { AcceptsCommands } from "./Command";
import { Assembly } from "./machine2/Assembly";
import { Tick } from "./Tick";

export class SkipTick extends Tick {
  getNextAssembly(): Assembly {
    return this.assembly;
  }

  async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {}
}
