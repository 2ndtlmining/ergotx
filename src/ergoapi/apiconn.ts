import ky, { type KyInstance } from "ky";
import type { Block, Transaction } from "~/common/types";

const kyInstance = ky.extend({
  timeout: false,
  prefixUrl: "https://api.ergoplatform.com"
});
(<any>window).ky = ky;
(<any>window).kyInstance = kyInstance;

async function getBlocks(
  limit: number,
  offset: number,
  sortBy: "size" | "height",
  sortDirection: "asc" | "desc"
) {
  let result = await kyInstance
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

export async function getUnconfirmedTransactions() {
  const limit = 500;
  const offset = 0;
  const sortBy = "size";
  const sortDirection = "desc";

  let result = await kyInstance
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

export async function getLatestBlock() {
  let results = await getBlocks(1, 0, "height", "desc");
  return results[0];
}

export async function getBlocksAbove(height: number) {
  return await getBlocks(100, height, "height", "asc");
}

export async function getBlockTransactions(blockId: string) {
  let result = await kyInstance
    .get("api/v1/blocks/" + blockId, { retry: 3 })
    .json<{ block: { blockTransactions: Transaction[] } }>();

  return result.block.blockTransactions;
}
