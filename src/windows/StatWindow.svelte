<script lang="ts" context="module">
  import { writable } from "svelte/store";

  type Stats = {
    price: number | null;
    averageBlockTime: number | null;
    hashRate: number | null;
    circulatingSupply: number | null;
    averageFee: number | null;
    transactionToday: number | null;
  };

  async function fetchStats(): Promise<Stats> {
    let [netInfo, netStats] = await Promise.all([
      getNetworkInfo(),
      getNetworkStats()
    ]);

    return {
      price: null,
      // in milli seconds
      averageBlockTime: parseNumber(
        netStats?.["blockSummary"]?.["averageMiningTime"]
      ),
      hashRate: parseNumber(netInfo?.["hashRate"]),
      circulatingSupply: parseNumber(netInfo?.["supply"]),
      averageFee: null,
      transactionToday: parseNumber(
        netStats?.["transactionsSummary"]?.["total"]
      )
    };
  }

  let statsPromise = writable<Promise<Stats>>(new Promise(() => {}));

  export function reloadStats() {
    statsPromise.set(
      fetchStats().then(stats => {
        console.log(stats);
        return stats;
      })
    );
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
  import { formatNumber, parseNumber } from "~/common/utils";
  import { getNetworkInfo, getNetworkStats } from "~/ergoapi/apiconn";
  import { MILLISECOND_TO_MINUTE } from "~/common/constants";
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
      <h4>Average Block Time</h4>
      <span class="value"
        >{stats.averageBlockTime
          ? formatNumber(stats.averageBlockTime * MILLISECOND_TO_MINUTE) +
            " min"
          : "N/A"}</span
      >
    </div>

    <div class="stat">
      <span class="icon text-[#ff6f91]">
        <IconHash />
      </span>
      <h4>Hashrate</h4>
      <span class="value">
        {stats.hashRate ? formatNumber(stats.hashRate / 1e12) + " TH/s" : "N/A"}
      </span>
    </div>

    <div class="stat">
      <span class="icon text-[#eeee53]">
        <IconReplaceFilled />
      </span>
      <h4>Circulating Supply</h4>
      <span class="value"
        >{stats.circulatingSupply
          ? formatNumber(stats.circulatingSupply / 1e9, { mantissa: 0 }) + " ERG"
          : "N/A"}</span
      >
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
      <span class="value">{formatNumber(stats.transactionToday) || "N/A"}</span>
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
