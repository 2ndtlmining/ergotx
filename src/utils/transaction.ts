import { Transaction } from "~/types/ergo";

/** Returns the total value/coins of a transaction in nanoERGs */
export function txTotalCoins(tx: Transaction): number {
  if (tx.ioSummary) {
    return tx.ioSummary.totalCoinsTransferred;
  }

  return tx.inputs.reduce((acc, input) => acc + input.value, 0);
}

/** Returns the total fee of a transaction in nanoERGs */
export function txTotalFee(tx: Transaction): number {
  return tx.ioSummary?.totalFee ?? 0;
}
