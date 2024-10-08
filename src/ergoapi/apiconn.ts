import ky from "ky";
import type { Block, Transaction } from "~/types/ergo";

const ERGO_PLATFORM_API = "https://api.ergoplatform.com";

const kyInstance = ky.extend({
  timeout: 120000
});

export async function getBlocks(
  limit: number,
  offset: number,
  sortBy: "size" | "height",
  sortDirection: "asc" | "desc"
) {
  let result = await kyInstance
    .get(ERGO_PLATFORM_API + "/api/v1/blocks", {
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
    .get(ERGO_PLATFORM_API + "/transactions/unconfirmed", {
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

export function getUnconfirmedTransaction(txId: string) {
  return kyInstance
    .get(ERGO_PLATFORM_API + "/transactions/unconfirmed/" + txId)
    .json<Transaction>();
}

export async function getConfirmedTransaction(txId: string) {
  let confirmed = await kyInstance
    .get(ERGO_PLATFORM_API + "/transactions/" + txId)
    .json<any>();

  let tx: Transaction = {
    id: confirmed["summary"]["id"],
    inputs: confirmed["inputs"],
    outputs: confirmed["outputs"],
    size: confirmed["summary"]["size"],
    ioSummary: confirmed["ioSummary"]
  };

  return tx;
}

export async function getLatestBlock() {
  let results = await getBlocks(1, 0, "height", "desc");
  return results[0];
}

export async function getBlocksAbove(height: number) {
  return await getBlocks(400, height, "height", "asc");
}

export async function getBlockTransactions(blockId: string) {
  let result = await kyInstance
    .get(ERGO_PLATFORM_API + "/api/v1/blocks/" + blockId, { retry: 3 })
    .json<{ block: { blockTransactions: Transaction[] } }>();

  return result.block.blockTransactions;
}

/* ================== */

export async function getNetworkInfo() {
  return await kyInstance.get(ERGO_PLATFORM_API + "/api/v0/info").json<any>();
}

export async function getNetworkStats() {
  return await kyInstance.get(ERGO_PLATFORM_API + "/api/v0/stats").json<any>();
}

export async function getOracleData() {
  let jsonString = await kyInstance
    .get("https://erg-oracle-ergusd.spirepools.com/frontendData")
    .json<string>();

  let result = JSON.parse(jsonString);
  return result;
}

/* ================== */

export function exploreAddressUrl(address: string) {
  return `https://explorer.ergoplatform.com/en/addresses/${address}`;
}
