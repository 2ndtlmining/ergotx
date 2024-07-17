import { TransactedBlock, Transaction } from "~/common/types";

export type Update =
  | { type: "txs"; transactions: Transaction[] }
  | { type: "block"; block: TransactedBlock };
