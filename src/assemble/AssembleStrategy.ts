import type { Transaction } from "~/common/types";
import { PlacementMap } from "~/engine/machine2/PlacementMap";

export interface AssembleStrategy {
  assembleTransactions(transactions: Transaction[]): PlacementMap;
}
