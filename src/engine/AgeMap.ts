import { TX_MAX_AGE } from "~/common/constants";
import { Transaction } from "~/common/types";

export class AgeMap {
  private map: Map<string, number>;

  constructor() {
    this.map = new Map();
  }

  public get(txId: string) {
    return this.map.get(txId) ?? 0;
  }

  public set(txId: string, age: number) {
    this.map.set(txId, age);
  }

  public has(txId: string) {
    return this.map.has(txId);
  }

  public remove(txId: string) {
    this.map.delete(txId);
  }

  public union(
    currentTransactions: Transaction[],
    newTransactions: Transaction[]
  ): [AgeMap, Transaction[]] {
    let newMap = new AgeMap();
    let includedTransactions: Transaction[] = [];

    for (const tx of newTransactions) {
      newMap.set(tx.id, 1);
      includedTransactions.push(tx);
    }

    for (const tx of currentTransactions) {
      if (newMap.has(tx.id)) {
        // Ignore if the transaction is one of the new transactions (and
        // hence already has been accounted for in the above loop)
        continue;
      }

      // Otherwise include it only if it is not expired
      let newAge = this.get(tx.id) + 1;

      if (newAge <= TX_MAX_AGE) {
        newMap.set(tx.id, newAge);
        includedTransactions.push(tx);
      }
    }

    return [newMap, includedTransactions];
  }

  public difference(
    currentTransactions: Transaction[],
    removeTransactions: Transaction[]
  ): [AgeMap, Transaction[]] {
    let newMap = new AgeMap();
    let includedTransactions: Transaction[] = [];

    for (const tx of removeTransactions) {
      newMap.set(tx.id, -1);
    }

    for (const tx of currentTransactions) {
      if (newMap.get(tx.id) === -1) {
        newMap.remove(tx.id);
        continue;
      }

      newMap.set(tx.id, this.get(tx.id));
      includedTransactions.push(tx);
    }

    newMap.map.forEach((value, key) => {
      if (value === -1)
        newMap.remove(key);
    });

    return [newMap, includedTransactions];
  }
}
