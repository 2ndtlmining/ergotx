import type { Transaction } from "~/common/types";
import type { Placement } from "~/common/Placement";

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
  | { type: "drive_off" };

export interface AcceptsCommands {
  executeCommands(commands: Command[]): Promise<unknown>;
}
