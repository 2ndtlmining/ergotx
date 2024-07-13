import ky, { type KyInstance } from "ky";
import {
  setIntervalAsync,
  clearIntervalAsync,
  type SetIntervalAsyncTimer
} from "set-interval-async";
import {
  Block,
  TransactedBlock,
  SortDirection,
  Transaction,
  VoidCallack
} from "./app_types";

class ApiService {
  private kyInstance: KyInstance;

  constructor() {
    this.kyInstance = ky.extend({
      timeout: false,
      prefixUrl: "https://api.ergoplatform.com"
    });
  }

  // limit: number,
  // sortBy: "size" | "creationtimestamp",
  // sortDirection: SortDirection
  public async getUnconfirmedTransactions() {
    const limit = 500;
    const offset = 0;
    const sortBy = "size";
    const sortDirection = "desc";

    let result = await this.kyInstance
      .get("transactions/unconfirmed", {
        searchParams: {
          limit,
          offset,
          sortBy,
          sortDirection
        }
      })
      .json<{ items: Transaction[] }>();

    return result.items;
  }

  private async _getBlocks(
    limit: number,
    offset: number,
    sortBy: "size" | "height",
    sortDirection: SortDirection
  ) {
    let result = await this.kyInstance
      .get("api/v1/blocks", {
        searchParams: {
          limit,
          offset,
          sortBy,
          sortDirection
        }
      })
      .json<{ items: Block[] }>();

    return result.items;
  }

  public async getLatestBlock() {
    let results = await this._getBlocks(1, 0, "height", "desc");
    return results[0];
  }

  public async getBlocksAbove(height: number) {
    return await this._getBlocks(100, height, "height", "asc");
  }

  public async getBlockTransactions(blockId: string) {
    let result = await this.kyInstance
      .get("api/v1/blocks/" + blockId, { retry: 3 })
      .json<{ block: { blockTransactions: Transaction[] } }>();

    return result.block.blockTransactions;
  }
}

export class UpdateService {
  private api: ApiService;

  private callbackTx!: VoidCallack<Transaction[]>;
  private callbackBlock!: VoidCallack<TransactedBlock>;

  private lastConfirmedBlockHeight = -1;

  private taskId: SetIntervalAsyncTimer<any> | null = null;
  private TASK_INTERVAL_MS = 3500;

  constructor() {
    this.api = new ApiService();

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
    let transactions = await this.api.getBlockTransactions(block.id);

    setTimeout(() => {
      this.callbackBlock({
        ...block,
        transactions
      });
    }, 0);
  }

  private async _updateBlocks() {
    if (this.lastConfirmedBlockHeight === -1) {
      let block = await this.api.getLatestBlock();
      this.lastConfirmedBlockHeight = block.height;
      this._emitBlock(block);
    } else {
      let blocks = await this.api.getBlocksAbove(this.lastConfirmedBlockHeight);

      // TODO: implement some form of events queue
      for (const block of blocks) {
        this.lastConfirmedBlockHeight = block.height;
        this._emitBlock(block);
      }
    }
  }

  private async _updateTransactions() {
    let txs = await this.api.getUnconfirmedTransactions();
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

// export class Application {
//   private updateService: UpdateService;

//   private mempool: Transaction[];
//   private latestBlock: Block | null;

//   constructor() {
//     this.mempool = [];
//     this.latestBlock = null;

//     this.updateService = new UpdateService()
//       .onUnconfirmedTransactions(transactions => {
// console.log("Found new txs: ", transactions.length);
// let changed = false;
// for (const candidTransaction of transactions) {
//   let existing = this.mempool.find(
//     tx => tx.id === candidTransaction.id
//   );
//   if (existing) continue;

//   this.mempool.push(candidTransaction);
//   changed = true;
// }

//         if (changed) this._repaint();
//       })
//       .onNewBlock(block => {
//         console.log("Found new block at height: ", block.height);

//         let { transactions, ...blockWithoutTxs } = block;

//         for (let blockTx of transactions) {
//           let existingIndex = this.mempool.findIndex(
//             tx => tx.id === blockTx.id
//           );

//           if (existingIndex === -1) continue;

//           this.mempool.splice(existingIndex, 1);
//         }

//         this.latestBlock = blockWithoutTxs;
//         this._repaint();
//       });

//     this.updateService.start();
//   }

//   private _repaint() {
//     let htmlMempoolCount = document.getElementById("mempool-count")!;
//     let htmlMempoolTxs = document.getElementById("mempool")!;
//     let htmlLatestBlock = document.getElementById("latest-block")!;

//     htmlMempoolCount.innerText = this.mempool.length.toString();
//     htmlMempoolTxs.innerText = this.mempool.map(tx => tx.id).join("\n");
//     htmlLatestBlock.innerText = JSON.stringify(this.latestBlock, null, 2);
//   }
// }

// async function main() {
//   let app = new Application();
// }

// main();
