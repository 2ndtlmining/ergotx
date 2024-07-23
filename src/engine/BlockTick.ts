import { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { AcceptsCommands, Command } from "~/common/Command";
import { Assembly } from "./Assembly";
import { Tick } from "./Tick";
import { TransactedBlock, Transaction } from "~/common/types";
import { Placement } from "~/common/Placement";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";
import { walkIfNeeded } from "./utils";

export class BlockTick extends Tick {
  private targetAssembly: Assembly;

  constructor(
    assembly: Assembly,
    assembleStrategy: AssembleStrategy,
    private readonly block: TransactedBlock
  ) {
    super(assembly, assembleStrategy);

    let [newAgeMap, newTransactions] = assembly.ageMap.difference(
      assembly.transactions,
      block.transactions
    );

    let pMap = this.assembleStrategy.assembleTransactions(newTransactions);

    this.targetAssembly = new Assembly(newTransactions, newAgeMap, pMap);
  }

  getNextAssembly(): Assembly {
    return this.targetAssembly;
  }

  public async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {
    let activeTransactions = this.targetAssembly.transactions;
    let blockTransactions = this.block.transactions;

    let spawns: Command[] = [];
    let walks: Command[] = [];

    // ========== Block transactions ==========

    for (const tx of blockTransactions) {
      let pBefore = this.assembly.placementMap.get(tx.id);

      // If the transaction did not exist in the last snapshot then
      // make sure to spawn it first
      if (!pBefore) {
        spawns.push({ type: "spawn", tx });
      }

      // Move it to top block
      walkIfNeeded(walks, tx, pBefore, {
        type: "block",
        index: 0
      });
    }

    // ========== Active transactions ==========

    const yielding: Transaction[] = [];

    for (const tx of activeTransactions) {
      let pBefore = this.assembly.placementMap.get(tx.id)!;
      let pAfter = {
        // Clone as it will be modified below
        ...this.targetAssembly.placementMap.get(tx.id)!
      };

      if (pAfter.type === "block") {
        // Shift it to the block below.
        // It will be moved back up after drive off
        pAfter.index++;

        // If it goes out of bounds after shifting then we
        // will handle it later
        if (pAfter.index === NUM_FUTURE_BLOCKS) {
          yielding.push(tx);
          continue;
        }
      }

      walkIfNeeded(walks, tx, pBefore, pAfter);
    }

    // ========== Yielding transactions ==========

    const yieldOuts: Command[] = [];
    const yieldIns: Command[] = [];

    for (const tx of yielding) {
      let pBefore = this.assembly.placementMap.get(tx.id)!;

      // These are all the transactions which have no where to go after
      // reassembly. These need to first go to waiting zone and then, after
      // driving off, need to go to the last future block

      if (pBefore.type !== "waiting")
        yieldOuts.push({
          type: "walk",
          tx,
          source: pBefore,
          dest: {
            type: "waiting"
          }
        });

      yieldIns.push({
        type: "walk",
        tx,
        source: pBefore,
        dest: {
          type: "block",
          index: NUM_FUTURE_BLOCKS - 1
        }
      });
    }

    let sequence: Command[][] = [
      spawns,
      walks,
      yieldOuts,
      [{ type: "drive_off" }],
      yieldIns
    ];

    for (const batch of sequence) {
      if (batch)
        // ...
        await cmdExecutor.executeCommands(batch);
    }
  }
}