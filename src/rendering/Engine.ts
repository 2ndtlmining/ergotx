import { Transaction } from "~/common/types";
import { DefaultAssembleStrategy } from "./assembly";
import { PropSet } from "~/common/PropSet";

import { UpdateService } from "~/ergoapi/UpdateService";
import { Placement, arePlacementsEqual } from "./Placement";

import { type Renderer } from "./Renderer";

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
        placement: { type: "waiting" }
      };
      this.txIdToState.set(tx.id, insertState);
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

export interface Move {
  tx: Transaction;
  placement: Placement | null; // null only if isDying is true
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
    let placementBefore = snapshotA.states.getState(tx)?.placement ?? null;
    let placementAfter = snapshotB.states.getState(tx)?.placement ?? null;

    let aliveBefore = Boolean(placementBefore);
    let aliveNow = Boolean(placementAfter);

    if (aliveBefore && aliveNow) {
      // check if placement is changed
      if (!arePlacementsEqual(placementBefore!, placementAfter!)) {
        moves.push({
          tx,
          placement: placementAfter,
          isSpawning: false,
          isDying: false
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

export class Engine {
  private assembly: AssemblySnapshot;
  private targetAssembly: AssemblySnapshot | null;
  private activeMoves: Move[];
  private pendingMoves: number;

  private renderer: Renderer;
  private isIdle: boolean;

  /* ====== Queuing ====== */
  private updateService: UpdateService;
  private txSetQueue: Transaction[][];

  constructor(renderer: Renderer) {
    // Starts with empty assembly
    this.assembly = new AssemblySnapshot([], new TxStateSet());
    this.targetAssembly = null;
    this.activeMoves = [];
    this.pendingMoves = 0;

    this.renderer = renderer;

    this.updateService = new UpdateService();
    this.txSetQueue = [];

    this.isIdle = true;
  }

  public startListening() {
    this.updateService.onUnconfirmedTransactions(txs => {
      this.txSetQueue.push(txs);
    });
    this.updateService.start();
  }

  private startTxTick(incomingTx: Transaction[]) {
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
    this.pendingMoves = this.activeMoves.length;

    console.log("activeMoves = ", this.activeMoves);
  }

  public onMoveComplete(moveHandle: number) {
    this.pendingMoves = Math.max(0, this.pendingMoves - 1);
    if (this.pendingMoves === 0) {
      this.onTickEnd();
    }
  }

  public onTickEnd() {
    console.log(`TickEnd`);
    this.assembly = this.targetAssembly!;
    this.targetAssembly = null;
    this.activeMoves = [];
    this.isIdle = true;
  }

  private getNextTxSet(): Transaction[] | null {
    if (this.txSetQueue.length === 0) {
      return null;
    }

    let first = this.txSetQueue.shift()!;

    if (first.length === 0) return null;

    return first;
  }

  public update() {
    if (this.isIdle) {
      let incomingTx = this.getNextTxSet();
      if (incomingTx !== null) {
        console.log(`TickStart::TXS (${incomingTx.length})`);
        this.isIdle = false;
        this.startTxTick(incomingTx);

        if (this.activeMoves.length === 0) {
          this.onTickEnd();
        } else {
          for (let i = 0; i < this.activeMoves.length; ++i) {
            this.renderer.executeMove(i, this.activeMoves[i]);
          }
        }
      }
    }
  }

  /* ================================ */

  public getActiveMove(moveHandle: number) {
    return this.activeMoves[moveHandle];
  }
}

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
