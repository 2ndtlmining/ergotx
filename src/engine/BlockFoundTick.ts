import { AssembleStrategy } from "~/assemble/AssembleStrategy";
import { PropSet } from "~/common/PropSet";
import { TransactedBlock, Transaction } from "~/common/types";
import { AcceptsCommands, Command } from "./Command";
import { arePlacementsEqual } from "./Placement";
import { AssemblySnapshot, TxStateSet } from "./state-snapshot";
import { Tick } from "./Tick";
import { assembleWith } from "./utils";

export class BlockFoundTick extends Tick {
  // private targetAssembly: AssemblySnapshot;

  constructor(
    assembly: AssemblySnapshot,
    assembleStrategy: AssembleStrategy,
    protected readonly block: TransactedBlock
  ) {
    super(assembly, assembleStrategy);
  }

  getNextAssembly(): AssemblySnapshot {
    return this.assembly;
  }

  async applyCommands(cmdExecutor: AcceptsCommands): Promise<void> {
  }
}


/*

private async startBlockTick(block: TransactedBlock) {
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

  // Calculate target assembly
  this.assembleTxs(newStates, remainingTransactions);
  this.targetAssembly = new AssemblySnapshot(
    remainingTransactions,
    newStates
  );

  let spawns: Command[] = [];
  let walks: Command[] = [];

  for (const tx of block.transactions) {
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

  for (const tx of remainingTransactions) {
    let placementBefore = this.assembly.states.getState(tx)!.placement;
    let placementAfter = structuredClone(
      this.targetAssembly.states.getState(tx)!.placement
    );

    if (placementAfter.type === "block")
      //
      placementAfter.index += 1;

    if (!arePlacementsEqual(placementBefore, placementAfter)) {
      walks.push({
        type: "walk",
        tx,
        placement: placementAfter
      });
    }
  }

  if (spawns)
    await this.cmdExecutor.executeCommands(spawns);

  if (walks)
    await this.cmdExecutor.executeCommands(walks);
}

*/