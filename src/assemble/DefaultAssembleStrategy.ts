import type { Transaction } from "~/common/types";
import type {
  AssembleStrategy,
  AssembledTransaction
} from "./AssembleStrategy";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";

export class DefaultAssembleStrategy implements AssembleStrategy {
  public assembleTransactions(
    transactions: Transaction[]
  ): AssembledTransaction[] {
    const NODES_PER_BLOCK = 5;
    const MAX_BLOCKS = NUM_FUTURE_BLOCKS;

    let nodes: AssembledTransaction[] = [];
    let filledBlocks = 0;

    let i = 0;

    while (i < transactions.length && filledBlocks < MAX_BLOCKS) {
      let slice = transactions.slice(i, i + NODES_PER_BLOCK);
      for (const tx of slice) {
        nodes.push({
          tx,
          placement: { type: "block", index: filledBlocks }
        });
      }

      i += NODES_PER_BLOCK;
      filledBlocks++;
    }

    while (i < transactions.length) {
      nodes.push({
        tx: transactions[i],
        placement: { type: "waiting" }
      });
      i++;
    }

    return nodes;
  }
}
