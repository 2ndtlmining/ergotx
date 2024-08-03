<script lang="ts">
  import { Transaction } from "~/common/types";
  import { txTotalCoins, txTotalFee } from "~/common/utils";
  import {
    getConfirmedTransaction,
    getUnconfirmedTransaction
  } from "~/ergoapi/apiconn";

  export let txId: string;

  async function fetchInfo() {
    let tx: Transaction | null = null;

    try {
      tx = await getUnconfirmedTransaction(txId);
    } catch (e) {
      try {
        tx = await getConfirmedTransaction(txId);
      } catch (e) {}
    }

    if (tx === null) {
      return null;
    }

    let totalFee = txTotalFee(tx);

    return {
      id: tx.id,
      totalCoins: txTotalCoins(tx),
      totalFee,
      feePerByte: totalFee / tx.size,
      size: tx.size
    };
  }

  // type TxInfo = Awaited<ReturnType<typeof fetchInfo>>;

  let txInfoPromise = new Promise(() => {});

  export function reloadTxInfo() {
    txInfoPromise = fetchInfo().then(txInfo => {
      // console.log(txInfo);
      return txInfo;
    });
  }

  $: txId && reloadTxInfo();
</script>

{#await txInfoPromise}
  Loading ...
{:then txInfo}
  <main>Nothing</main>
{/await}

<style lang="postcss">
</style>
