import type { Transaction } from "~/common/types";
import type { Placement } from "./Placement";

export type Command =
  | { type: "spawn"; tx: Transaction }
  | { type: "kill"; tx: Transaction }
  | { type: "walk"; tx: Transaction; placement: Placement }
  | { type: "drive_off" };

export interface AcceptsCommands {
  executeCommands(commands: Command[]): Promise<unknown>;
}
