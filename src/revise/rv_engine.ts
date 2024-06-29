import Phaser, { Scene } from "phaser";
import { Transaction } from "./rv_types";

// import { Placement } from "./rv_vistypes";

export type Placement =
  /* Tx is not currently placed anywhere */
  // | { type: "not_placed" }
  // /* Tx is at its house */
  // | { type: "house" }
  /* Tx is in waiting zone */
  | { type: "waiting" }
  /* Tx is in a block at the given index (from top) */
  | { type: "block"; index: number }
  // /* Tx is being destroyed */
  // | { type: "destruction" };

/* ================================== */

interface MempoolNode {
  // The actual transaction
  tx: Transaction;

  // Where this transaction currently is in the world
  placement: Placement;
}

interface TxState {
  // Index of the house this transaction originated from
  houseIndex: number;

  // Age since last refresh
  age: number;

  // Is this transaction still a part of mempool or not (either
  // because it has been included in a block or expired away)
  alive: boolean;
}

class TxStateRepo {
  private txIdToIdentity: Map<string, TxState>;

  public tickAll() {
    // update age of all
  }

  public markSeen(tx: Transaction) {
    // reset age or create new
  }

  public remove(tx: Transaction) {
    // remove from state
  }
}

// class NodeBuilder {
//   private houseService: HouseService;

//   constructor(houseService: HouseService) {
//     this.houseService = houseService;
//   }

//   public buildNode(tx: Transaction): MempoolNode {
//     return {
//       tx,
//       placement: { type: "waiting" }, // "waiting" default
//       houseIndex: this.houseService.getHouseForTransaction(tx).index,
//       age: 0,
//       alive: true
//     };
//   }
// }

function Assemble(transactions: Transaction[]): MempoolNode[] {
  const NODES_PER_BLOCK = 5;
  const MAX_BLOCKS = 5;

  let nodes: MempoolNode[] = [];
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
  }

  while (i < transactions.length) {
    nodes.push({
      tx: transactions[i],
      placement: { type: 'waiting' }
    })
  }

  return nodes;
}

/*

allNodes

tick(newTxs):
  let txs = allMempoolNodes.map(intoTx)
  txs = mergeTxs(txs, newTxs)
    apply TxStateRepo

  newNodes = Assemble(txs)


*/

/* ========================== */

interface House {
  index: number;
  name: string;
}

class HouseList {
  private houses: House[] = [];

  constructor() {
    this.houses = [];
  }

  public addHouse(name: string) {
    let index = this.houses.length;
    this.houses.push({
      index,
      name
    });
  }

  public getHouses() {
    return this.houses;
  }

  public getHouseByIndex(index: number) {
    return this.houses[index];
  }
}

class HouseService {
  private list: HouseList;

  constructor(list: HouseList) {
    this.list = list;
  }

  public getHouses() {
    return this.list.getHouses();
  }

  public getHouseByIndex(index: number) {
    return this.list.getHouseByIndex(index);
  }

  public getHouseForTransaction(tx: Transaction): House {
    return this.getHouseByIndex(0); // FIXME: Random
  }
}
/* ========================== */
