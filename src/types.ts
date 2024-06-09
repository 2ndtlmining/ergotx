import { Math } from "phaser";

export type SortDirection = "asc" | "desc";

export type VoidCallack<T> = (payload: T) => void;

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
  // creationTimestamp: number;
  // size: number;
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

export interface BlockTransaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  // timestamp: number;
}

export interface BlockWithTransactions extends Block {
  transactions: BlockTransaction[];
}

/* ====================== */
export type PersonLocation =
  | { type: 'waiting' }
  | { type: 'home', id: number /* index for now */ }
  | { type: 'bus', index: number }
  | { type: 'destroy' }

// export type PersonLocationType = PersonLocation['type'];