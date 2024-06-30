import Phaser, { Scene } from "phaser";
import { Transaction } from "./rv_types";
import { DefaultAssembleStrategy } from "./rv_assemble";

/* ================================== */

type Placement =
  /* The tx is yet to be spawned */
  | { type: "none" }
  /* Tx is in waiting zone */
  | { type: "waiting" }
  /* Tx is in a block at the given index (from top) */
  | { type: "block"; index: number };

/* ========================== */

const TX_MAX_AGE = 4;

class TxState {
  // Age
  age: number;

  // Alive
  alive: boolean;

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

  public isAlive(tx: Transaction) {
    return Boolean(this.getState(tx)?.alive);
  }

  public markSeen(tx: Transaction) {
    let state = this.getState(tx);
    if (state) {
      state.age = 0;
    } else {
      let insertState: TxState = {
        age: 0,
        alive: true,
        placement: { type: "none" } // TODO: default ?
      };
    }
  }
}

class AssemblySnapshot {
  constructor(
    public readonly transactions: Transaction[],
    public readonly states: TxStateSet
  ) {}

  public clone() {
    return new AssemblySnapshot([...this.transactions], this.states.clone());
  }
}

class Engine {
  private assembly: AssemblySnapshot;

  constructor() {
    // Starts with empty assembly
    this.assembly = new AssemblySnapshot([], new TxStateSet());
  }

  private onTx(incomingTx: Transaction[]) {
    let newAssembly = this.assembly.clone();

    newAssembly.states.incrementAll();

    for (const tx of incomingTx) {
      newAssembly.states.markSeen(tx);
    }

    let addedTxIds: Set<string> = new Set();
    let toAssembleTransactions: Transaction[] = [];

    for (const tx of [...newAssembly.transactions, ...incomingTx]) {
      let state = newAssembly.states.getState(tx)!;
      if (state.age >= TX_MAX_AGE) {
        state.alive = false;
      }

      if (state.alive && !addedTxIds.has(tx.id)) {
        addedTxIds.add(tx.id);
        toAssembleTransactions.push(tx);
      }
    }

    // assembly
    let assembledTransactions =
      new DefaultAssembleStrategy().assembleTransactions(
        toAssembleTransactions
      );

    for (const { tx, placement } of assembledTransactions) {
      let state = newAssembly.states.getState(tx)!;
      state.placement = placement;
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

Assembler:
  assemble(transactions)

Engine:
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
