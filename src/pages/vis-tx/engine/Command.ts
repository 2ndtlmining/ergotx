import type { Transaction } from "~/types/ergo";
import type { Placement } from "./assemble/Placement";

export type Command =
  | {
      type: "spawn";
      tx: Transaction;
      at?: Placement | null;
    }
  | {
      type: "walk";
      tx: Transaction;
      source: Placement | null;
      dest: Placement;
    }
  | { type: "kill"; tx: Transaction }
  | { type: "step_forward" };

export interface AcceptsCommands {
  executeCommands(commands: Command[]): Promise<unknown>;
  reset(): void;
}
