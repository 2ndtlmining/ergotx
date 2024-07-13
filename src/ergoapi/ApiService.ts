import ky, { type KyInstance } from "ky";

import { Block, Transaction } from "~/common/types";

export class ApiService {
  private kyInstance: KyInstance;

  constructor() {
    this.kyInstance = ky.extend({
      timeout: false,
      prefixUrl: "https://api.ergoplatform.com"
    });
  }

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
    sortDirection: "asc" | "desc"
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
