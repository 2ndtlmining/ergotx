import Phaser, { Scene } from "phaser";
import { Transaction } from "./rv_types";

/* ================================== */

interface TxState {
  // // Index of the house this transaction originated from
  // houseIndex: number;

  // Age since last refresh
  age: number;

  // Is this transaction still a part of mempool or not (either
  // because it has been included in a block or expired away)
  alive: boolean;
}

class TxStateManager {
  private txIdToState: Map<string, TxState>;

  public static MAX_AGE = 4;

  constructor() {
    this.txIdToState = new Map();
  }

  public incrementAll() {
    // increment age of all entries
    this.txIdToState.forEach(state => {
      state.age++;
    });
  }

  public verifyPresence(tx: Transaction) {
    // reset age, or create a new state
    let state = this.getState(tx);
    if (state) {
      state.age = 0;
    } else {
      let insertState: TxState = {
        age: 0,
        alive: true
        // houseIndex: this.houseService.getHouseForTransaction(tx).index
      };
    }
  }

  public getState(tx: Transaction) {
    return this.txIdToState.get(tx.id);
  }

  public remove(tx: Transaction) {
    // remove from state
    this.txIdToState.delete(tx.id);
  }

  // public forEach(callback: (state: TxState, txId: string) => void) {
  //   this.txIdToState.forEach(callback);
  // }

  // public kill(tx: Transaction) {
  //   // Set alive = false (TODO for garbage collection)
  //   let state = this.getState(tx);
  //   if (state) {
  //     state.alive = false;
  //   }

  //   // this.txIdToState.forEach(state => {
  //   //   if (state.age >= TxStateManager.MAX_AGE) {
  //   //     state.alive = false;
  //   //   }
  //   // });
  // }
}

/* ====================================== */

type Placement =
  /* Tx is in waiting zone */
  | { type: "waiting" }
  /* Tx is in a block at the given index (from top) */
  | { type: "block"; index: number };

interface MempoolNode {
  // The actual transaction
  tx: Transaction;

  // Where this transaction currently is in the world
  placement: Placement;
}

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
      placement: { type: "waiting" }
    });
  }

  return nodes;
}

/* ====================================== */

class MempoolApp {
  nodes: MempoolNode[];
  houseService: HouseService;
  txStateManager: TxStateManager;

  constructor() {
    this.nodes = [];
    this.houseService = new HouseService(this.buildHouseList());
    this.txStateManager = new TxStateManager();
  }

  private buildHouseList() {
    let list = new HouseList();
    list.addHouse("House A");
    list.addHouse("House B");
    list.addHouse("House C");
    return list;
  }

  public startTransactionTick(newTransactions: Transaction[]) {
    // set tick state init
    let prevNodes = this.nodes;

    newTransactions = this.applyMerge(
      prevNodes.map(node => node.tx),
      newTransactions
    );

    let newNodes = Assemble(newTransactions);

    // set tick state visualizing
  }

  private applyMerge(
    transactions: Transaction[],
    newTransactions: Transaction[]
  ) {
    // Increment age of all previous transactions
    this.txStateManager.incrementAll();

    // Reset age (or insert new with age 0) of all new transactions
    for (const tx of newTransactions) {
      this.txStateManager.verifyPresence(tx);
    }

    let allTransactions = [...transactions, ...newTransactions];
    let aliveTransactions: Transaction[] = [];

    for (const tx of allTransactions) {
      let state = this.txStateManager.getState(tx)!;
      if (state.age >= TxStateManager.MAX_AGE) {
        state.alive = false;
      } else {
        aliveTransactions.push(tx);
      }
    }

    return aliveTransactions;
  }
}

/*
Tick
  Init
  Visualizing
  CleanUp
*/

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

// TODO: 0th house (fallback house) is the house of any
// transaction which does not have a valid house
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

  public getTxHouseIndex(tx: Transaction): number {
    return 0; // FIXME: Random
  }
}
/* ========================== */
