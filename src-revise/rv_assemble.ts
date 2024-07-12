import { Transaction } from "./rv_types";

export type AssemblyPlacement =
  | { type: "waiting" }
  | { type: "block"; index: number };

export interface AssembledTransaction {
  tx: Transaction;
  placement: AssemblyPlacement;
}

export interface AssembleStrategy {
  assembleTransactions(transactions: Transaction[]): AssembledTransaction[];
}

export class DefaultAssembleStrategy implements AssembleStrategy {
  assembleTransactions(transactions: Transaction[]): AssembledTransaction[] {
    const NODES_PER_BLOCK = 5;
    const MAX_BLOCKS = 5;

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
