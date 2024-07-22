import { Transaction } from "~/common/types";
import { PropSet } from "~/common/PropSet";
import { arePlacementsEqual } from "~/common/Placement";

import { AssembleStrategy } from "~/assemble/AssembleStrategy";

import { AcceptsCommands, Command } from "./Command";
import { Tick } from "./Tick";
import { Assembly } from "./Assembly";

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
      let placementBefore = snapshotA.placementMap.get(tx.id);
      let placementAfter = snapshotB.placementMap.get(tx.id);

      let aliveBefore = Boolean(placementBefore);
      let aliveNow = Boolean(placementAfter);

      if (aliveBefore && aliveNow) {
        if (!arePlacementsEqual(placementBefore!, placementAfter!)) {
          walks.push({
            type: "walk",
            tx,
            prevPlacement: placementBefore,
            placement: placementAfter!
          });
        }
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
          prevPlacement: placementBefore,
          placement: placementAfter!
        });
      }
    }

    if (lifespans.length > 0) await cmdExecutor.executeCommands(lifespans);

    if (walks.length > 0) await cmdExecutor.executeCommands(walks);
  }
}
