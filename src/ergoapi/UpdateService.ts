import {
  setIntervalAsync,
  clearIntervalAsync,
  type SetIntervalAsyncTimer
} from "set-interval-async";

import type {
  Block,
  TransactedBlock,
  Transaction,
  VoidCallack
} from "~/common/types";

import {
  getUnconfirmedTransactions,
  getBlockTransactions,
  getBlocksAbove,
  getLatestBlock
} from "./apiconn";

export class UpdateService {
  private callbackTx!: VoidCallack<Transaction[]>;
  private callbackBlock!: VoidCallack<TransactedBlock>;

  private lastConfirmedBlockHeight = -1;

  private taskId: SetIntervalAsyncTimer<any> | null = null;
  private TASK_INTERVAL_MS = 3500;

  constructor() {
    this.callbackTx = () => {};
    this.callbackBlock = () => {};
  }

  public start() {
    this.stop();

    this.taskId = setIntervalAsync(async () => {
      await this._updateBlocks();
      await this._updateTransactions();
    }, this.TASK_INTERVAL_MS);
  }

  private async _emitBlock(block: Block) {
    let transactions = await getBlockTransactions(block.id);

    setTimeout(() => {
      this.callbackBlock({
        ...block,
        transactions
      });
    }, 0);
  }

  private async _updateBlocks() {
    if (this.lastConfirmedBlockHeight === -1) {
      let block = await getLatestBlock();
      this.lastConfirmedBlockHeight = block.height;
      this._emitBlock(block);
    } else {
      let blocks = await getBlocksAbove(this.lastConfirmedBlockHeight);

      for (const block of blocks) {
        this.lastConfirmedBlockHeight = block.height;
        this._emitBlock(block);
      }
    }
  }

  private async _updateTransactions() {
    let txs = await getUnconfirmedTransactions();
    if (txs.length > 0)
      setTimeout(() => {
        this.callbackTx(txs);
      }, 0);
  }

  public stop() {
    if (this.taskId) clearIntervalAsync(this.taskId);
  }

  // Called when a newly seen unconfirmed transaction is found
  public onUnconfirmedTransactions(
    callbackTx: VoidCallack<Transaction[]>
  ): this {
    this.callbackTx = callbackTx;
    return this;
  }

  // Called when a new block is successfully mined
  public onNewBlock(callbackBlock: VoidCallack<TransactedBlock>): this {
    this.callbackBlock = callbackBlock;
    return this;
  }
}
