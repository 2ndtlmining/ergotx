import { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { Assembly } from "./Assembly";
import { AcceptsCommands, Command } from "./Command";
import { Tick } from "./Tick";
import { TransactedBlock } from "~/common/types";
import { arePlacementsEqual, Placement } from "~/common/Placement";

export class BlockTick extends Tick {
  private targetAssembly: Assembly;

  constructor(
    assembly: Assembly,
    assembleStrategy: AssembleStrategy,
    private readonly block: TransactedBlock
  ) {
    super(assembly, assembleStrategy);

    let [newAgeMap, newTransactions] = assembly.ageMap.shrinked(
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
      let placementBefore = this.assembly.placementMap.get(tx.id);
      let placementAfter: Placement = { type: "block", index: 0 };

      // If the transaction did not exist in the last snapshot
      if (!placementBefore) {
        // First spawn and the move to top block
        spawns.push({ type: "spawn", tx });
        walks.push({
          type: "walk",
          tx,
          placement: placementAfter
        });
      }
      // Otherwise (placement did exist before) check if it was
      // anywhere other than top block. If so, then move it to top block
      else if (!arePlacementsEqual(placementBefore, placementAfter)) {
        walks.push({
          type: "walk",
          tx,
          placement: placementAfter
        });
      }
    }
  }
}

/*
export class BlockFoundTick extends Tick {
  private targetAssembly: AssemblySnapshot;

  async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {
    let spawns: Command[] = [];
    let walks: Command[] = [];

    for (const tx of this.block.transactions) {
      let placementBefore = this.assembly.states.getState(tx)?.placement;
      let placementAfter: Placement = { type: "block", index: 0 };

      // If the transaction did not exist in the last snapshot
      if (!placementBefore) {
        // First spawn and the move to top block
        spawns.push({ type: "spawn", tx });
        walks.push({
          type: "walk",
          tx,
          placement: placementAfter
        });
      }
      // Otherwise (placement did exist before) check if it was
      // anywhere other than top block. If so, then move it to top block
      else if (!arePlacementsEqual(placementBefore, placementAfter)) {
        walks.push({
          type: "walk",
          tx,
          placement: placementAfter
        });
      }
    }

    let yieldOuts: Command[] = [];
    let yieldIns: Command[] = [];

    for (const tx of this.targetAssembly.transactions) {
      let placementBefore = this.assembly.states.getState(tx)!.placement;
      let placementAfter = this.targetAssembly.states.getState(tx)!.placement;

      let nextPlacment: Placement =
        placementAfter.type === "waiting"
          ? { type: "waiting" }
          : { type: "block", index: placementAfter.index + 1 };

      if (!arePlacementsEqual(placementBefore, nextPlacment)) {
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
