import { TransactedBlock, Transaction } from "~/types/ergo";

export type Update =
  | { type: "txs"; transactions: Transaction[] }
  | { type: "block"; block: TransactedBlock };
