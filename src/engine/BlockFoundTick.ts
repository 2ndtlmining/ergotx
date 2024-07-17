import { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { TransactedBlock, Transaction } from "~/common/types";
import { AcceptsCommands, Command } from "./Command";
import { arePlacementsEqual, Placement } from "./Placement";
import { AssemblySnapshot } from "./state-snapshot";
import { Tick } from "./Tick";
import { assembleWith } from "./utils";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";

export class BlockFoundTick extends Tick {
  private targetAssembly: AssemblySnapshot;
  // private remainingTransactions: Transaction[];

  constructor(
    assembly: AssemblySnapshot,
    assembleStrategy: AssembleStrategy,
    protected readonly block: TransactedBlock
  ) {
    super(assembly, assembleStrategy);

    let newStates = this.assembly.states.clone();
    let remainingTransactions: Transaction[] = [];

    for (const tx of this.assembly.transactions) {
      // If this transaction is also part of the (found and
      // outgoing) block then remove it
      if (block.transactions.find(blockTx => blockTx.id === tx.id)) {
        newStates.remove(tx);
      }
      // Otherwise store it for reassembly
      else {
        remainingTransactions.push(tx);
      }
    }

    this.targetAssembly = assembleWith(
      this.assembleStrategy,
      newStates,
      remainingTransactions
    );
  }

  getNextAssembly(): AssemblySnapshot {
    return this.targetAssembly;
  }

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
