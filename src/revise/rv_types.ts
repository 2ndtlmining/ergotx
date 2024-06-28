/* ====================== */

export type SortDirection = "asc" | "desc";
export type VoidCallack<T> = (payload: T) => void;

/* ====================== */

export interface TransactionInput {
  id: string;
  value: number;
  index: number;
  address: string;
}

export interface TransactionOutput {
  id: string;
  value: number;
  index: number;
  address: string;
}

export interface Transaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
}

/* ====================== */

export interface Block {
  id: string;
  height: number;
  transactionsCount: number;
  miner: {
    address: string;
    name: string;
  };
  size: number;
}

export interface TransactedBlock extends Block {
  transactions: Transaction[];
}

/* ====================== */
