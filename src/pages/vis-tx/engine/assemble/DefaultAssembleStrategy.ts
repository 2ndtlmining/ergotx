import { NUM_FUTURE_BLOCKS } from "~/common/constants";
import { PlacementMap } from "~/common/Placement";
import type { Transaction } from "~/common/types";

import type { AssembleStrategy } from "./AssembleStrategy";

export class DefaultAssembleStrategy implements AssembleStrategy {
  public assembleTransactions(transactions: Transaction[]): PlacementMap {
    const NODES_PER_BLOCK = 5;
    const MAX_BLOCKS = NUM_FUTURE_BLOCKS;

    let pMap = new PlacementMap();

    let filledBlocks = 0;

    let i = 0;

    while (i < transactions.length && filledBlocks < MAX_BLOCKS) {
      let slice = transactions.slice(i, i + NODES_PER_BLOCK);
      for (const tx of slice) {
        pMap.placeBlock(tx.id, filledBlocks);
      }

      i += NODES_PER_BLOCK;
      filledBlocks++;
    }

    while (i < transactions.length) {
      pMap.placeWaiting(transactions[i].id);
      i++;
    }

    return pMap;
  }
}
