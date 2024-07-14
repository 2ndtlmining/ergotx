import { Transaction } from "~/common/types";
import { Placement } from "./Placement";

export type Command =
  | { type: "spawn"; tx: Transaction }
  | { type: "kill"; tx: Transaction }
  | { type: "walk"; tx: Transaction; placement: Placement }
  | { type: "drive_off" };
