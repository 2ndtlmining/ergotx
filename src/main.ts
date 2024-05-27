import ky, { type KyInstance } from "ky";
import { Block, SortDirection, Transaction, VoidCallack } from "./types";

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
    const sortBy = "size";
    const sortDirection = "desc";

    let result = await this.kyInstance
      .get("transactions/unconfirmed", {
        searchParams: { limit, sortBy, sortDirection }
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
        searchParams: { limit, offset, sortBy, sortDirection }
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
}

class UpdateService {
  private api: ApiService;

  private callbackTx!: VoidCallack<Transaction[]>;
  private callbackBlock!: VoidCallack<Block>;

  private lastConfirmedBlockHeight = -1;

  private taskId: number = -1;
  private TASK_INTERVAL_MS = 3500;

  constructor() {
    this.api = new ApiService();
  }

  public apply(): this {
    if (this.taskId === -1) this.destroy();

    this.taskId = setInterval(async () => {
      this._updateBlocks();
      this._updateTransactions();
    }, this.TASK_INTERVAL_MS);

    return this;
  }

  private async _updateBlocks() {
    if (this.lastConfirmedBlockHeight === -1) {
      let block = await this.api.getLatestBlock();
      this.lastConfirmedBlockHeight = block.height;
      this.callbackBlock(block);
    } else {
      let blocks = await this.api.getBlocksAbove(this.lastConfirmedBlockHeight);

      // TODO: implement some form of events queue
      for (const block of blocks) {
        this.callbackBlock(block);
        this.lastConfirmedBlockHeight = block.height;
      }
    }
  }

  private async _updateTransactions() {
    let txs = await this.api.getUnconfirmedTransactions();
    if (txs.length > 0) this.callbackTx(txs);
  }

  public destroy() {
    clearInterval(this.taskId);
  }

  // Called when a newly seen unconfirmed transaction is found
  public onUnconfirmedTransactions(
    callbackTx: VoidCallack<Transaction[]>
  ): this {
    this.callbackTx = callbackTx;
    return this;
  }

  // Called when a new block is successfully mined
  public onNewBlock(callbackBlock: VoidCallack<Block>): this {
    this.callbackBlock = callbackBlock;
    return this;
  }
}

async function main() {
  // let txs = await Api.getUnconfirmedTransactions(100, "size", "asc");
  // console.log(txs);

  let updateService = new UpdateService()
    .onUnconfirmedTransactions(transactions => {
      console.log("Found new txs: ", transactions.length);
    })
    .onNewBlock(block => {
      console.log("Found new block at height: ", block.height);
    })
    .apply();
}

main();
