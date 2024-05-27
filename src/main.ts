import ky from "ky";
import { Block, Transaction } from "./types";

const ERGO_PLATFORM_API = "https://api.ergoplatform.com";

let kyInstance = ky.extend({
  timeout: false,
  prefixUrl: ERGO_PLATFORM_API
});

type SortDirection = "asc" | "desc";

class Api {
  public static async getUnconfirmedTransactions(
    limit: number,
    sortBy: "size" | "creationtimestamp",
    sortDirection: SortDirection
  ) {
    let result = await kyInstance
      .get("transactions/unconfirmed", {
        searchParams: { limit, sortBy, sortDirection }
      })
      .json<{ items: Transaction[]}>();

    return result.items;
  }

  private static async _getBlocks(
    limit: number,
    offset: number,
    sortBy: "size" | "height",
    sortDirection: SortDirection
  ) {
    let result = await kyInstance
      .get("api/v1/blocks", {
        searchParams: { limit, offset, sortBy, sortDirection }
      })
      .json<{ items: Block[] }>();

    return result.items;
  }

  public static async getLatestBlock() {
    let results = await Api._getBlocks(1, 0, "height", "desc");
    return results[0];
  }

  public static async getBlocksAbove(height: number) {
    return await Api._getBlocks(100, height, "height", "asc");
  }
}

async function main() {
  let txs = await Api.getUnconfirmedTransactions(100, "size", "asc");
  console.log(txs);
}

main();
