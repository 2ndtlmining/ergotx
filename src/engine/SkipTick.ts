import { AcceptsCommands } from "./Command";
import { AssemblySnapshot } from "./state-snapshot";
import { Tick } from "./Tick";

export class SkipTick extends Tick {
  getNextAssembly(): AssemblySnapshot {
    return this.assembly;
  }

  async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {}
}
