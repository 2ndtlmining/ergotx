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

function arePlacementsEqual(a: Placement, b: Placement) {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case "waiting":
      return true;
    case "block":
      return a.index === (<any>b).index;

    default:
      return false;
  }
}

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
  constructor(
    public readonly transactions: Transaction[],
    public readonly states: TxStateSet
  ) {}
}

/* ====================================== */

interface Move {
  tx: Transaction;
  placement: Placement | null;
  isSpawning: boolean;
  isDying: boolean;
}

function CalculateMoves(
  snapshotA: AssemblySnapshot,
  snapshotB: AssemblySnapshot
) {
  let combinedSet = PropSet.fromArray(
    [...snapshotA.transactions, ...snapshotB.transactions],
    tx => tx.id
  );

  let moves: Move[] = [];

  for (const tx of combinedSet.getItems()) {
    let aliveBefore = snapshotA.states.isAlive(tx);
    let aliveNow = snapshotB.states.isAlive(tx);

    let placementBefore = snapshotA.states.getState(tx)?.placement ?? null;
    let placementAfter = snapshotB.states.getState(tx)?.placement ?? null;

    if (aliveBefore && aliveNow) {
      // check placement
      if (!arePlacementsEqual(placementBefore!, placementAfter!)) {
        moves.push({
          tx,
          placement: placementAfter,
          isSpawning: false,
          isDying: false,
        });
      }
    } else if (aliveBefore && !aliveNow) {
      // register destroy move
      moves.push({
        tx,
        placement: null,
        isSpawning: false,
        isDying: true
      });
    } else if (!aliveBefore && aliveNow) {
      // register 'waiting' or 'block' move depending on placement. spawns
      moves.push({
        tx,
        placement: placementAfter,
        isSpawning: true,
        isDying: false
      });
    }
  }

  return moves;
}

/* ====================================== */

class Engine {
  private assembly: AssemblySnapshot;
  private targetAssembly: AssemblySnapshot | null;
  private activeMoves: Move[];

  constructor() {
    // Starts with empty assembly
    this.assembly = new AssemblySnapshot([], new TxStateSet());
    this.targetAssembly = null;
  }

  private onTx(incomingTx: Transaction[]) {
    let newStates = this.assembly.states.clone();

    // increment
    newStates.incrementAll();

    // append new or reset age of new
    for (const tx of incomingTx) {
      newStates.markSeen(tx);
    }

    // remove with age >= MAX_AGE
    let combinedSet = PropSet.fromArray(
      [...this.assembly.transactions, ...incomingTx],
      tx => tx.id
    );

    let newTransactions: Transaction[] = [];

    for (const tx of combinedSet.getItems()) {
      let state = newStates.getState(tx)!;
      if (state.age >= TX_MAX_AGE) {
        newStates.remove(tx);
      } else {
        newTransactions.push(tx);
      }
    }

    let assembled = new DefaultAssembleStrategy().assembleTransactions(
      newTransactions
    );

    for (const { tx, placement } of assembled) {
      newStates.getState(tx)!.placement = placement;
    }

    let newAssembly = new AssemblySnapshot(newTransactions, newStates);
    this.targetAssembly = newAssembly;
    this.activeMoves = CalculateMoves(this.assembly, newAssembly);
  }
}

/* ================================ */


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

