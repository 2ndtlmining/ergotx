import Phaser, { Scene } from "phaser";
import { Transaction } from "./rv_types";

/* ================================== */

interface TxState {
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
      };
    }
  }

  public getState(tx: Transaction) {
    return this.txIdToState.get(tx.id);
  }

  // public remove(tx: Transaction) {
  //   // remove from state
  //   this.txIdToState.delete(tx.id);
  // }

  public isAlive(tx: Transaction) {
    return Boolean(this.getState(tx)?.alive);
  }
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

  // Where this transaction currently is in assembly
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

class MempoolSnapshot {
  constructor(
    public readonly nodes: MempoolNode[],
    public readonly states: TxStateManager
  ) {}
}

/* ====================================== */

type MovePin =
  | { to: "waiting" }
  | { to: "block"; index: number }
  | { to: "destroy" };

type Move = {
  tx: Transaction;
  pin: MovePin;
};

function CalculateMoves(snapshotA: MempoolSnapshot, snapshotB: MempoolSnapshot) {
  let combined = [...snapshotA.nodes, ...snapshotB.nodes];

  for (const node of combined) {
    // let oldPlacement: Placement;
    // let newPlacement: Placement;
    let aliveBefore = snapshotA.states.isAlive(node.tx);
    let aliveNow = snapshotB.states.isAlive(node.tx);

    if (aliveBefore && aliveNow) {
      // check placement
    }
    else if (aliveBefore && !aliveNow) {
      // register destroy move
    }
    else if (!aliveBefore && aliveNow) {
      // register 'waiting' or 'block' move depending on placement
    }
  }
}

/* ====================================== */

class MempoolApp {
  private houseService: HouseService;
  private nodes: MempoolNode[];
  private states: TxStateManager;

  constructor() {
    this.nodes = [];
    this.houseService = new HouseService(this.buildHouseList());
    this.states = new TxStateManager();
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
    this.states.incrementAll();

    // Reset age (or insert new with age 0) of all new transactions
    for (const tx of newTransactions) {
      this.states.verifyPresence(tx);
    }

    let allTransactions = [...transactions, ...newTransactions];
    let aliveTransactions: Transaction[] = [];

    for (const tx of allTransactions) {
      let state = this.states.getState(tx)!;
      if (state.age >= TxStateManager.MAX_AGE) {
        state.alive = false;
      } else {
        aliveTransactions.push(tx);
      }
    }

    return aliveTransactions;
  }
}

/* ========================== */

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

  public getTxHouse(tx: Transaction): House {
    return this.getHouseByIndex(0); // FIXME: Random
  }
}
/* ========================== */
