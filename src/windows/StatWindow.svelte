<script lang="ts" context="module">
  import { writable } from "svelte/store";

  type Stats = {
    price: number;
    averageBlockTimes: number;
    hashRate: number;
    circulatingSupply: number;
    averageFee: number;
    transactionToday: number;
  };

  async function fetchStats(): Promise<Stats> {
    let [netInfo, netStats] = await Promise.all([
      getNetworkInfo(),
      getNetworkStats()
    ]);

    return {
      price: 0,
      averageBlockTimes: netStats["blockSummary"]["averageMiningTime"],
      hashRate: netInfo["hashRate"],
      circulatingSupply: netInfo["supply"],
      averageFee: 0,
      transactionToday: netStats["transactionsSummary"]["total"]
    };
  }

  let statsPromise = writable<Promise<Stats>>(new Promise(() => {}));

  export function reloadStats() {
    statsPromise.set(fetchStats());
  }

  reloadStats();
</script>

<script lang="ts">
  import {
    IconClockRecord,
    IconCurrencyDollar,
    IconHash,
    IconReceiptDollar,
    IconReplaceFilled,
    IconRosetteDiscountCheck
  } from "@tabler/icons-svelte";
  import { getNetworkInfo, getNetworkStats } from "~/ergoapi/apiconn";
</script>

{#await $statsPromise}
  Loading ...
{:then stats}
  <main>
    <div class="stat">
      <span class="icon text-[#8efff6]">
        <IconCurrencyDollar />
      </span>
      <h4>Price</h4>
      <span class="value">N/A</span>
    </div>

    <div class="stat">
      <span class="icon text-[#ff8066]">
        <IconClockRecord />
      </span>
      <h4>Average Block Times</h4>
      <span class="value">N/A</span>
    </div>

    <div class="stat">
      <span class="icon text-[#ff6f91]">
        <IconHash />
      </span>
      <h4>Hashrate</h4>
      <span class="value">N/A</span>
    </div>

    <div class="stat">
      <span class="icon text-[#eeee53]">
        <IconReplaceFilled />
      </span>
      <h4>Circulating Supply</h4>
      <span class="value">N/A</span>
    </div>

    <div class="stat">
      <span class="icon text-[#35f38b]">
        <IconReceiptDollar />
      </span>
      <h4>Average Fee</h4>
      <span class="value">N/A</span>
    </div>

    <div class="stat">
      <span class="icon text-[#009efa]">
        <IconRosetteDiscountCheck />
      </span>
      <h4>Total Transaction Today</h4>
      <span class="value">{stats.transactionToday}</span>
    </div>
  </main>
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
