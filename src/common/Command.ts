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
  | { type: "step_forward" };

// export type Event =
//   // Fired when a new block is found
//   | { type: "block_found" }
//   // Fired when the size of mempool changes
//   | { type: "mempool_updated"; mempoolSize: number };

export interface AcceptsCommands {
  executeCommands(commands: Command[]): Promise<unknown>;
  reset(): void;
}
