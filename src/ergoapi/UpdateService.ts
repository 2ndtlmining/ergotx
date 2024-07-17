import { TransactedBlock, Transaction, VoidCallback } from "~/common/types";
import { EventEmitter } from "eventemitter3";

interface UpdateEvents {
  txs: VoidCallback<Transaction[]>;
  block: VoidCallback<TransactedBlock>;
}

export abstract class UpdateService extends EventEmitter<UpdateEvents> {
  abstract start(): void;
  abstract stop(): void;
}
