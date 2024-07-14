import type { Transaction } from "~/common/types";
import type { Placement } from "./Placement";

export class TxState {
  // Age
  age: number;

  // Placement
  placement: Placement;
}

export class TxStateSet {
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

export class AssemblySnapshot {
  constructor(
    public readonly transactions: Transaction[],
    public readonly states: TxStateSet
  ) {}
}