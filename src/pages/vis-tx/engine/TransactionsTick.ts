import type { Transaction } from "~/types/ergo";
import { PropSet } from "~/utils/PropSet";

import type { AssembleStrategy } from "./assemble/AssembleStrategy";
import { Assembly } from "./assemble/Assembly";

import type { AcceptsCommands, Command } from "./Command";
import { Tick } from "./Tick";
import { walkIfNeeded } from "./utils";

export class TransactionsTick extends Tick {
  private targetAssembly: Assembly;

  constructor(
    assembly: Assembly,
    assembleStrategy: AssembleStrategy,
    incomingTxs: Transaction[]
  ) {
    super(assembly, assembleStrategy);

    let [newAgeMap, newTransactions] = assembly.ageMap.union(
      assembly.transactions,
      incomingTxs
    );

    let pMap = this.assembleStrategy.assembleTransactions(newTransactions);

    this.targetAssembly = new Assembly(newTransactions, newAgeMap, pMap);
  }

  getNextAssembly(): Assembly {
    return this.targetAssembly;
  }

  async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {
    let combinedSet = PropSet.fromArray(
      [
        // ...
        ...this.assembly.transactions,
        ...this.targetAssembly!.transactions
      ],
      tx => tx.id
    );

    let lifespans: Command[] = [];
    let walks: Command[] = [];

    for (const tx of combinedSet.getItems()) {
      let pBefore = this.assembly.placementMap.get(tx.id);
      let pAfter = this.targetAssembly.placementMap.get(tx.id);

      // If the transaction did not exist in the last snapshot then
      // make sure to spawn it first
      if (!pBefore) {
        lifespans.push({ type: "spawn", tx });
      }

      // Either move it or kill it depending on target assembly
      if (pAfter) {
        walkIfNeeded(walks, tx, pBefore, pAfter);
      } else {
        lifespans.push({ type: "kill", tx });
      }
    }

    if (lifespans.length > 0)
      // ...
      await cmdExecutor.executeCommands(lifespans);

    if (walks.length > 0)
      // ...
      await cmdExecutor.executeCommands(walks);
  }
}
