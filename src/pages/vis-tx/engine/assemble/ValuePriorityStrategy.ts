import { NUM_FUTURE_BLOCKS } from "~/constants/general";
import { PlacementMap } from "./Placement";
import type { Transaction } from "~/types/ergo";

import type { AssembleStrategy } from "./AssembleStrategy";
import { txTotalFee } from "~/utils/transaction";

export class ValuePriorityStrategy implements AssembleStrategy {
  public assembleTransactions(transactions: Transaction[]): PlacementMap {
    let pMap = new PlacementMap();
    
    const MAX_BLOCK_SIZE = 8e6; // 8 MB
    
    // fill block in desceding order of transaction fees until the block is
    // full, and then move over to the next block
    
    let filledBlocks = 0;
    let remainingSize = MAX_BLOCK_SIZE;
    let i = 0;
    
    transactions.sort((txA, txB) => {
      return txTotalFee(txB) - txTotalFee(txA);
    });
    
    while (filledBlocks < NUM_FUTURE_BLOCKS && i < transactions.length) {
      let tx = transactions[i++];
      let size = tx.size;

      // Move to next block once we run out of size in the current
      // block
      if (size > remainingSize) {
        filledBlocks++;
        remainingSize = MAX_BLOCK_SIZE;
      }
      
      remainingSize -= size;
      pMap.placeBlock(tx.id, filledBlocks);
    }
    
    // When all the blocks are full, then the remaining transactions go
    // to the waiting area
    while (i < transactions.length) {
      pMap.placeWaiting(transactions[i].id);
      i++;
    }
    
    return pMap;
  }
}
