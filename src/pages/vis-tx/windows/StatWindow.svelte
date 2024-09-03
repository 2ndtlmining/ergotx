<script lang="ts" context="module">
  import { writable } from "svelte/store";

  function safeDivide(nom: number, denom: number) {
    if (denom === 0) return 0;

    return nom / denom;
  }

  async function fetchStats() {
    let [netInfo, netStats, oracleData] = await Promise.all([
      getNetworkInfo(),
      getNetworkStats(),
      getOracleData()
    ]);

    let totalFee = parseNumber(netStats?.["transactionsSummary"]?.["totalFee"]);

    let transactionToday = parseNumber(
      netStats?.["transactionsSummary"]?.["total"]
    );

    let averageFee =
      totalFee !== null && transactionToday !== null
        ? safeDivide(totalFee, transactionToday)
        : null;

    return {
      price: parseNumber(oracleData?.["latest_price"]),
      // in milli seconds
      averageBlockTime: parseNumber(
        netStats?.["blockSummary"]?.["averageMiningTime"]
      ),
      hashRate: parseNumber(netInfo?.["hashRate"]),
      // nano ERG
      circulatingSupply: parseNumber(netInfo?.["supply"]),
      // nano ERG
      averageFee,
      transactionToday
    };
  }

  type Stats = Awaited<ReturnType<typeof fetchStats>>;

  let statsPromise = writable<Promise<Stats>>(new Promise(() => {}));

  export function reloadStats() {
    statsPromise.set(
      fetchStats().then(stats => {
        // console.log(stats);
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
  import { formatNumber, parseNumber } from "~/utils/number";
  import {
    getNetworkInfo,
    getNetworkStats,
    getOracleData
  } from "~/ergoapi/apiconn";
  import { MILLISECOND_TO_MINUTE } from "~/constants/general";
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
      <span class="value"
        >{stats.price
          ? formatNumber(stats.price, { mantissa: 2 }) +
            " USD"
          : "N/A"}</span
      >
    </div>

    <div class="stat">
      <span class="icon text-[#ff8066]">
        <IconClockRecord />
      </span>
      <h4>Average Block Time</h4>
      <span class="value">
        {stats.averageBlockTime
          ? `${Math.floor(stats.averageBlockTime * MILLISECOND_TO_MINUTE)} min
      ${Math.floor((stats.averageBlockTime * MILLISECOND_TO_MINUTE) % 1 * 60)} sec`
          : "N/A"}
</span>


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
          ? formatNumber(stats.circulatingSupply / 1e9, { mantissa: 2 }) +
            " ERG"
          : "N/A"}</span
      >
    </div>

    <div class="stat">
      <span class="icon text-[#35f38b]">
        <IconReceiptDollar />
      </span>
      <h4>Average Fee</h4>
      <span class="value"
        >{stats.averageFee
          ? formatNumber(stats.averageFee / 1e9, { mantissa: 8 }) + " ERG"
          : "N/A"}</span
      >
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
</style>
