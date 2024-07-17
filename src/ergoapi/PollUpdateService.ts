import {
  setIntervalAsync,
  clearIntervalAsync,
  type SetIntervalAsyncTimer
} from "set-interval-async";

import type { Block } from "~/common/types";

import {
  getUnconfirmedTransactions,
  getBlockTransactions,
  getBlocksAbove,
  getLatestBlock
} from "./apiconn";

import { UpdateService } from "./UpdateService";

export class PollUpdateService extends UpdateService {
  private lastConfirmedBlockHeight = -1;

  private taskId: SetIntervalAsyncTimer<any> | null = null;
  private TASK_INTERVAL_MS = 3500;

  public start() {
    this.stop();

    this.taskId = setIntervalAsync(async () => {
      await this.updateBlocks();
      await this.updateTransactions();
    }, this.TASK_INTERVAL_MS);
  }

  public stop() {
    if (this.taskId) clearIntervalAsync(this.taskId);
  }

  private async fillAndEmitBlock(block: Block) {
    let transactions = await getBlockTransactions(block.id);

    setTimeout(() => {
      this.emitBlock({
        ...block,
        transactions
      });
    }, 0);
  }

  private async updateBlocks() {
    if (this.lastConfirmedBlockHeight === -1) {
      let block = await getLatestBlock();
      this.lastConfirmedBlockHeight = block.height;
      this.fillAndEmitBlock(block);
    } else {
      let blocks = await getBlocksAbove(this.lastConfirmedBlockHeight);

      for (const block of blocks) {
        this.lastConfirmedBlockHeight = block.height;
        this.fillAndEmitBlock(block);
      }
    }
  }

  private async updateTransactions() {
    let txs = await getUnconfirmedTransactions();
    if (txs.length > 0)
      setTimeout(() => {
        this.emitTxs(txs);
      }, 0);
  }
}
