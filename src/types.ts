export type SortDirection = "asc" | "desc";

export type VoidCallack<T> = (payload: T) => void;

export interface ErgoTransactionInput {
  id: string;
  value: number;
  index: number;
  address: string;
}

export interface ErgoTransactionOutput {
  id: string;
  value: number;
  index: number;
  address: string;
}

export interface Transaction {
  id: string;
  inputs: ErgoTransactionInput[];
  outputs: ErgoTransactionOutput[];
  creationTimestamp: number;
  size: number;
}

export interface Block {
  id: string;
  height: number;
  epoch: number;
  version: number;
  timestamp: number;
  transactionsCount: number;
  miner: {
    address: string;
    name: string;
  };
  size: number;
  difficulty: number;
  minerReward: number;
}
