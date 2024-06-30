import Phaser, { Scene } from "phaser";
import { Transaction } from "./rv_types";
import { DefaultAssembleStrategy } from "./rv_assemble";
import { PropSet } from "./rv_propset";

/* ================================== */

type Placement =
  /* Tx is in waiting zone */
  | { type: "waiting" }
  /* Tx is in a block at the given index (from top) */
  | { type: "block"; index: number };

/* ========================== */

const TX_MAX_AGE = 4;

class TxState {
  // Age
  age: number;

  // Placement
  placement: Placement;
}

class TxStateSet {
  private txIdToState: Map<string, TxState>;

  constructor() {
    this.txIdToState = new Map();
  }

  public entries() {
    return this.txIdToState.entries();
  }

  public clone() {
    let other = new TxStateSet();
    other.txIdToState = structuredClone(this.txIdToState);
    return other;
  }

  public incrementAll() {
    // increment age of all entries
    this.txIdToState.forEach(state => {
      state.age++;
    });
  }

  public getState(tx: Transaction) {
    return this.txIdToState.get(tx.id);
  }

  public remove(tx: Transaction) {
    this.txIdToState.delete(tx.id);
  }

  public isAlive(tx: Transaction) {
    return this.txIdToState.has(tx.id);
  }

  public markSeen(tx: Transaction) {
    let state = this.getState(tx);
    if (state) {
      state.age = 0;
    } else {
      let insertState: TxState = {
        age: 0,
        placement: { type: "waiting" } // TODO: default ?
      };
    }
  }
}

class AssemblySnapshot {
  constructor(public transactions: Transaction[], public states: TxStateSet) {}

  public clone() {
    return new AssemblySnapshot([...this.transactions], this.states.clone());
  }
}

class Engine {
  private assembly: AssemblySnapshot;
  /*
  targetAssembly
  spawningTxs
  dyingTxs
  movingTxs
  */

  constructor() {
    // Starts with empty assembly
    this.assembly = new AssemblySnapshot([], new TxStateSet());
  }

  private onTx(incomingTx: Transaction[]) {
    let newAssembly = this.assembly.clone();

    // increment
    newAssembly.states.incrementAll();

    // append new or reset age of new
    for (const tx of incomingTx) {
      newAssembly.states.markSeen(tx);
    }

    // remove with age >= MAX_AGE
    let combinedSet = PropSet.fromArray(
      [...newAssembly.transactions, ...incomingTx],
      tx => tx.id
    );

    let newTransactions: Transaction[] = [];

    for (const tx of combinedSet.getItems()) {
      let state = newAssembly.states.getState(tx)!;
      if (state.age >= TX_MAX_AGE) {
        newAssembly.states.remove(tx);
      } else {
        newTransactions.push(tx);
      }
    }

    newAssembly.transactions = newTransactions;

    let assembled = new DefaultAssembleStrategy().assembleTransactions(
      newTransactions
    );

    for (const { tx, placement } of assembled) {
      newAssembly.states.getState(tx)!.placement = placement;
    }
  }
}
/*
function CalculateMoves(snapshotA: AssemblySnapshot, snapshotB: AssemblySnapshot) {
  let combined = [...snapshotA.transactions, ...snapshotB.transactions];

  for (const tx of combined) {
    let aliveBefore = snapshotA.states.isAlive(tx);
    let aliveNow = snapshotB.states.isAlive(tx);

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
} */

/*

Assembly:
  txs
  placements
  age

Engine:
  currentAssembly
  targetAssembly
  spawningTxs
  dyingTxs
  movingTxs

Engine Tasks:
  Receive Transactions
  CheckAge
  Assemble
  Calculate Moves
  Track previous state

Renderer
  TickStart
  TickApply
  ...
  TickApply
  TickEnd

--------

Tick
  Init
  Visualizing
  CleanUp

------

tick(newTxs):
  let txs = allMempoolNodes.map(intoTx)
  txs = mergeTxs(txs, newTxs)
    apply TxStateRepo

  newNodes = Assemble(txs)

*/

/* ========================== */
