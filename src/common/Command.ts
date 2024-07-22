import type { Transaction } from "~/common/types";
import type { Placement } from "~/common/Placement";

export type Command =
  | { type: "spawn"; tx: Transaction; placement?: Placement | null }
  | { type: "kill"; tx: Transaction }
  | {
    type: "walk";
    tx: Transaction;
    placement: Placement;
    prevPlacement: Placement | null;
  }
  | { type: "drive_off" };

export interface AcceptsCommands {
  executeCommands(commands: Command[]): Promise<unknown>;
}
