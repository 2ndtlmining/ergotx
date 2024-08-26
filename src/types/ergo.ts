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
  ergoTree: string;
}

export interface Transaction {
  id: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  size: number;
  ioSummary?: {
    totalCoinsTransferred: number;
    totalFee: number;
  };
}

export interface Block {
  id: string;
  height: number;
  transactionsCount: number;
  miner: {
    address: string;
    name: string;
  };
  size: number; // In bytes
  minerReward: number; // In nano ergs
}

export interface TransactedBlock extends Block {
  transactions: Transaction[];
}
