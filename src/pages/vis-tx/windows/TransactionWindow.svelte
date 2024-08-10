<script lang="ts">
  import type { Transaction } from "~/types/ergo";
  import { txTotalCoins, txTotalFee } from "~/utils/transaction";
  import {
    getConfirmedTransaction,
    getUnconfirmedTransaction
  } from "~/ergoapi/apiconn";
  import { formatErg } from "~/utils/number";

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

    if (tx == null) {
      return null;
    }

    let totalFee = txTotalFee(tx);

    return {
      id: tx.id,
      totalCoins: txTotalCoins(tx),
      totalFee,
      size: tx.size,
      feePerByte: totalFee / tx.size
    };
  }

  type TxInfo = Awaited<ReturnType<typeof fetchInfo>>;

  let txInfoPromise = new Promise<TxInfo>(() => {});

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
{:then info}
  {#if info === null}
    Not found
  {:else}
    <main>
      <div class="stat">
        <!-- <span class="icon text-[#8efff6]">
        <IconCurrencyDollar />
      </span> -->
        <h4>ID</h4>
        <span class="value">{info.id}</span>
      </div>

      <div class="stat">
        <!-- <span class="icon text-[#ff8066]">
        <IconClockRecord />
      </span> -->
        <h4>Total Coins</h4>
        <span class="value">{formatErg(info.totalCoins)}</span>
      </div>

      <div class="stat">
        <!-- <span class="icon text-[#ff6f91]">
        <IconHash />
      </span> -->
        <h4>Total Fee</h4>
        <span class="value">{formatErg(info.totalFee)}</span>
      </div>

      <div class="stat">
        <!-- <span class="icon text-[#eeee53]">
        <IconReplaceFilled />
      </span> -->
        <h4>Size</h4>
        <span class="value">{info.size} Bytes</span>
      </div>

      <div class="stat">
        <!-- <span class="icon text-[#35f38b]">
        <IconReceiptDollar />
      </span> -->
        <h4>Fee/Byte</h4>
        <span class="value">{formatErg(info.feePerByte)}</span>
      </div>
    </main>
  {/if}
{/await}

<style lang="postcss">
  .stat {
    @apply flex items-center gap-x-2;
    @apply py-2 border-b last:border-none border-slate-600;
  }

  .value {
    @apply ml-auto;
  }

  h4 {
    @apply font-bold whitespace-nowrap mr-8;
  }

  * {
    font-family: "Inter";
  }
</style>
