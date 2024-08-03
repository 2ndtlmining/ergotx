export type VoidCallback<T = void> = (payload: T) => void;

export interface Constructor<ReturnType> {
  new (...args: any[]): ReturnType;
}

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

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
  size: number;
  ioSummary?: {
    totalCoinsTransferred: number;
    totalFee: number;
  };
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
