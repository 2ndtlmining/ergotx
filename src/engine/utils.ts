import type { AssembleStrategy } from "~/assemble/AssembleStrategy";
import type { Transaction } from "~/common/types";
import { type TxStateSet, AssemblySnapshot } from "./state-snapshot";

export function assembleWith(
  strategy: AssembleStrategy,
  states: TxStateSet,
  transactions: Transaction[]
) {
  let assembled = strategy.assembleTransactions(transactions);

  for (const { tx, placement } of assembled) {
    states.getState(tx)!.placement = placement;
  }

  return new AssemblySnapshot(transactions, states);
}
