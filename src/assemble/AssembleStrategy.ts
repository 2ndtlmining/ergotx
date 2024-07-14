import type { Transaction } from "~/common/types";

export type AssemblyPlacement =
  | { type: "waiting" }
  | { type: "block"; index: number };

export interface AssembledTransaction {
  tx: Transaction;
  placement: AssemblyPlacement;
}

export interface AssembleStrategy {
  assembleTransactions(transactions: Transaction[]): AssembledTransaction[];
}