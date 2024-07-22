import { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { AcceptsCommands, Command } from "~/common/Command";
import { Assembly } from "./Assembly";
import { Tick } from "./Tick";
import { TransactedBlock, Transaction } from "~/common/types";
import { arePlacementsEqual, Placement } from "~/common/Placement";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";

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

    for (const tx of blockTransactions) {
      let pBefore = this.assembly.placementMap.get(tx.id);
      let pAfter: Placement = { type: "block", index: 0 };

      // If the transaction did not exist in the last snapshot
      if (!pBefore) {
        // First spawn and the move to top block
        spawns.push({ type: "spawn", tx });
        walks.push({
          type: "walk",
          tx,
          prevPlacement: null,
          placement: pAfter,
        });
      }
      // Otherwise (placement did exist before) check if it was
      // anywhere other than top block. If so, then move it to top block
      else if (!arePlacementsEqual(pBefore, pAfter)) {
        walks.push({
          type: "walk",
          tx,
          prevPlacement: pBefore,
          placement: pAfter
        });
      }
    }

    // ========== Active transactions ==========

    const yielding: Transaction[] = [];

    for (const tx of activeTransactions) {
      let pBefore = this.assembly.placementMap.get(tx.id)!;
      let pAfter = this.targetAssembly.placementMap.get(tx.id)!;

      let pShiftedAfter: Placement =
        pAfter.type === "waiting"
          ? { type: "waiting" }
          : { type: "block", index: pAfter.index + 1 };

      if (
        pShiftedAfter.type === "block" &&
        pShiftedAfter.index === NUM_FUTURE_BLOCKS
      ) {
        yielding.push(tx);
        continue;
      }

      if (!arePlacementsEqual(pBefore, pShiftedAfter)) {
        walks.push({
          type: "walk",
          tx,
          prevPlacement: pBefore,
          placement: pShiftedAfter
        });
      }
    }

    // ========== Yielding transactions ==========

    const yieldOuts: Command[] = [];
    const yieldIns: Command[] = [];

    for (const tx of yielding) {
      let pBefore = this.assembly.placementMap.get(tx.id)!;

      // These are all the transactions which have no where to go after
      // reassembly. These need to first go to waiting zone and then, after
      // driving off, need to go to the last future block

      if (pBefore.type === "block")
        yieldOuts.push({
          type: "walk",
          tx,
          prevPlacement: pBefore,
          placement: {
            type: "waiting"
          }
        });

      yieldIns.push({
        type: "walk",
        tx,
        prevPlacement: pBefore,
        placement: {
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
      if (batch) await cmdExecutor.executeCommands(batch);
    }
  }
}

/*
export class BlockFoundTick extends Tick {
  private targetAssembly: AssemblySnapshot;

  async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {
    let spawns: Command[] = [];
    let walks: Command[] = [];
    let yieldOuts: Command[] = [];
    let yieldIns: Command[] = [];

    for (const tx of this.targetAssembly.transactions) {
      let pBefore = this.assembly.states.getState(tx)!.placement;
      let pAfter = this.targetAssembly.states.getState(tx)!.placement;

      let nextPlacment: Placement =
        pAfter.type === "waiting"
          ? { type: "waiting" }
          : { type: "block", index: pAfter.index + 1 };

      if (!arePlacementsEqual(pBefore, nextPlacment)) {
        if (nextPlacment.type === "block") {
          if (nextPlacment.index === NUM_FUTURE_BLOCKS) {
            yieldOuts.push({
              type: "walk",
              tx,
              placement: { type: "waiting" }
            });
            yieldIns.push({
              type: "walk",
              tx,
              placement: { type: "block", index: NUM_FUTURE_BLOCKS - 1 }
            });
          }
        }
      }
    }

    let sequence: Command[][] = [
      spawns,
      walks,
      yieldOuts,
      [{ type: "drive_off" }],
      yieldIns
    ];

    for (const batch of sequence) {
      if (batch) await cmdExecutor.executeCommands(batch);
    }
  }
}
 */
