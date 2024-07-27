import type { Transaction } from "~/common/types";
import { PlacementMap } from "~/common/Placement";

export interface AssembleStrategy {
  assembleTransactions(transactions: Transaction[]): PlacementMap;
}
