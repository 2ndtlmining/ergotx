import { Transaction } from "~/common/types";
import { PropSet } from "~/common/PropSet";
import { AcceptsCommands, Command } from "~/common/Command";

import { AssembleStrategy } from "~/assemble/AssembleStrategy";

import { Tick } from "./Tick";
import { Assembly } from "./Assembly";
import { walkIfNeeded } from "./utils";

export class TransactionsTick extends Tick {
  private targetAssembly: Assembly;

  constructor(
    assembly: Assembly,
    assembleStrategy: AssembleStrategy,
    protected readonly incomingTxs: Transaction[]
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
    let snapshotA = this.assembly;
    let snapshotB = this.targetAssembly!;

    let combinedSet = PropSet.fromArray(
      [...snapshotA.transactions, ...snapshotB.transactions],
      tx => tx.id
    );

    let lifespans: Command[] = [];
    let walks: Command[] = [];

    for (const tx of combinedSet.getItems()) {
      let pBefore = snapshotA.placementMap.get(tx.id);
      let pAfter = snapshotB.placementMap.get(tx.id);

      let aliveBefore = Boolean(pBefore);
      let aliveNow = Boolean(pAfter);

      if (aliveBefore && aliveNow) {
        walkIfNeeded(walks, tx, pBefore, pAfter!);
      } else if (aliveBefore && !aliveNow) {
        // register destroy move
        lifespans.push({
          type: "kill",
          tx
        });
      } else if (!aliveBefore && aliveNow) {
        // First spawn
        lifespans.push({
          type: "spawn",
          tx
        });

        // and then register 'waiting' or 'block' depending
        // on placement
        walks.push({
          type: "walk",
          tx,
          prevPlacement: pBefore,
          placement: pAfter!
        });
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
