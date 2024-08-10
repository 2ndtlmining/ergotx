import type { Transaction } from "~/types/ergo";
import { PlacementMap } from "./Placement";

export interface AssembleStrategy {
  assembleTransactions(transactions: Transaction[]): PlacementMap;
}
