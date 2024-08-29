<script lang="ts">
  import { clearIntervalAsync, setIntervalAsync } from "set-interval-async";
  import { onMount } from "svelte";
  import {
    exploreAddressUrl,
    getBlocks,
    getBlocksAbove,
    getNetworkStats
  } from "~/ergoapi/apiconn";
  import type { Block } from "~/types/ergo";
  import { formatErg, formatNumber, parseNumber } from "~/utils/number";
  import { identityOfAddr } from '~/identities/Identity';

  import { calculateScores } from "./scores";

  import MineAnimation from "./MineAnimation.svelte";
  import RankTable from "./RankTable.svelte";
  import {
    IconBracketsContain,
    IconBulbFilled,
    IconHash,
    IconHourglass,
    IconReceipt2,
    IconWeight
  } from "@tabler/icons-svelte";

  // latest block at the end
  let blocks: Block[] = [];
  let lastBlockSeenTime = -1;
  let timeSinceLastBlock: string = "N/A";
  let stats = {
    difficulty: -1,
    hashRate: -1
  };
  let statLoading = false;

  let animation: MineAnimation | null;

  async function fetchLastDayBlocks() {
    let chunk1Promise = getBlocks(500, 0, "height", "desc");
    let chunk2Promise = getBlocks(220, 500, "height", "desc");

    let [chunk1, chunk2] = await Promise.all([chunk1Promise, chunk2Promise]);

    let allBlocks = [...chunk1, ...chunk2];

    allBlocks.reverse();

    return allBlocks;
  }

  async function fetchNewBlocks() {
    if (blocks.length === 0) {
      return await fetchLastDayBlocks();
    }

    let lastConfirmedHeight = blocks[blocks.length - 1].height;
    return await getBlocksAbove(lastConfirmedHeight);
  }

  function updateBlocks() {
    fetchNewBlocks().then(newBlocks => {
      if (newBlocks.length > 0) {
        lastBlockSeenTime = new Date().getTime();
        if (blocks.length > 0) {
          animation?.playBlockFound();
        }
      }

      let totalBlocks = blocks.length + newBlocks.length;
      let extra = Math.max(0, totalBlocks - 720);

      blocks = [...blocks, ...newBlocks].slice(extra);
    });
  }

  function updateTimeSinceLastBlock() {
    let now = new Date().getTime();

    let formatted =
      lastBlockSeenTime === -1
        ? "N/A"
        : formatNumber((now - lastBlockSeenTime) / 1000, { mantissa: 0 });

    timeSinceLastBlock = formatted;
  }

  $: scores = calculateScores(blocks);
  $: lastBlock = blocks.length ? blocks[blocks.length - 1] : null;
  $: lastBlockMinerName = (lastBlock && identityOfAddr(lastBlock?.miner.address)?.name) || lastBlock?.miner.name;

  onMount(() => {
    statLoading = true;
    // return;

    getNetworkStats().then(netStats => {
      stats.hashRate = parseNumber(netStats?.["miningCost"]?.["hashRate"], 0);
      stats.difficulty = parseNumber(
        netStats?.["miningCost"]?.["difficulty"],
        0
      );
      statLoading = false;
    });

    // Block fetcher
    updateBlocks();
    let blockFetcherId = setIntervalAsync(updateBlocks, 20 * 1000);

    // Block timer
    updateTimeSinceLastBlock();
    let blockTimerId = setInterval(updateTimeSinceLastBlock, 1000); // every second;

    return () => {
      clearIntervalAsync(blockFetcherId);
      clearInterval(blockTimerId);
    };
  });
</script>

<div class="overflow-hidden flex-1 flex flex-col">
  <div class="h-full max-h-[26rem] flex items-start gap-x-2">
    <div class="flex-1 max-h-full overflow-y-auto p-1 shrink-0">
      <RankTable {blocks} {scores} />
    </div>
    <div class="flex-1 shrink-0 p-4 space-y-4">
      <div
        class="w-full border-y-2 grid grid-cols-[repeat(3,1fr)] border-[#39393d] pb-4"
      >
        <div class="col-span-3 flex justify-between mt-2 mb-2 px-1">
          <p class="text-xs font-bold opacity-70">Global Stats</p>
        </div>

        <!-- Stat Item -->
        <div class="flex items-center">
          <!-- Icon -->
          <div class="rounded-full bg-[#0AD3FF]/10 text-[#0AD3FF] p-4">
            <IconHourglass size={24} />
          </div>
          <!-- /Icon -->
          <!-- Body -->
          <div class="self-stretch ml-2 py-2 space-y-1">
            <h1 class="text-xs font-medium">Last Block</h1>
            <p class="font-semibold">{timeSinceLastBlock} s</p>
          </div>
          <!-- /Body -->
        </div>
        <!-- /Stat Item -->

        <!-- Stat Item -->
        <div class="flex items-center">
          <!-- Icon -->
          <div class="rounded-full bg-[#8ACB88]/10 text-[#8ACB88] p-4">
            <IconHash size={24} />
          </div>
          <!-- /Icon -->
          <!-- Body -->
          <div class="self-stretch ml-2 py-2 space-y-1">
            <h1 class="text-xs font-medium">Hash Rate</h1>
            <p class="font-semibold">{formatNumber(stats.hashRate / 1e12)} TH/s</p>
          </div>
          <!-- /Body -->
        </div>
        <!-- /Stat Item -->

        <!-- Stat Item -->
        <div class="flex items-center">
          <!-- Icon -->
          <div class="rounded-full bg-[#FFBF46]/10 text-[#FFBF46] p-4">
            <IconWeight size={24} />
          </div>
          <!-- /Icon -->
          <!-- Body -->
          <div class="self-stretch ml-2 py-2 space-y-2.5">
            <h1 class="text-xs font-medium">Difficulty</h1>
            <p class="font-semibold text-xs">{formatNumber(stats.difficulty / 1e6, { thousandSeparator: false })} M</p>
          </div>
          <!-- /Body -->
        </div>
        <!-- /Stat Item -->
      </div>

      <!--  -->
      <!--  -->
      <!--  -->
      <!--  -->
      <!-- SECOND ONE -->
      <!--  -->
      <!--  -->
      <!--  -->
      <!--  -->
      <div
        class="w-full border-y-2 grid grid-cols-[repeat(3,1fr)] border-[#39393d] pb-4"
      >
        <div class="col-span-3 flex justify-between mt-2 mb-2 px-1">
          <p class="text-xs font-bold opacity-70">Last Block Stats</p>
          {#if lastBlock}
            <p class="text-xs">
              <span class="font-bold opacity-70">Miner:</span>
              <a
                class="link link-primary font-normal text-xs"
                target="_blank"
                href={exploreAddressUrl(lastBlock.miner.address)}
              >
                <!-- {lastBlock.miner.name} -->
                {lastBlockMinerName}
              </a>
            </p>
          {/if}
        </div>

        <!-- Stat Item -->
        <div class="flex items-center">
          <!-- Icon -->
          <div class="rounded-full bg-[#ff4687]/10 text-[#ff4687] p-4">
            <IconBracketsContain size={24} />
          </div>
          <!-- /Icon -->
          <!-- Body -->
          <div class="self-stretch ml-2 py-2 space-y-1">
            <h1 class="text-xs font-medium">Transactions</h1>
            <p class="font-semibold">{lastBlock?.transactionsCount ?? 0}</p>
          </div>
          <!-- /Body -->
        </div>
        <!-- /Stat Item -->

        <!-- Stat Item -->
        <div class="flex items-center">
          <!-- Icon -->
          <div class="rounded-full bg-[#ff8d46]/10 text-[#ff8d46] p-4">
            <IconReceipt2 size={24} />
          </div>
          <!-- /Icon -->
          <!-- Body -->
          <div class="self-stretch ml-2 py-2 space-y-1">
            <h1 class="text-xs font-medium">Fee</h1>
            <p class="font-semibold">
              {formatErg(lastBlock?.minerReward ?? 0)}
            </p>
          </div>
          <!-- /Body -->
        </div>
        <!-- /Stat Item -->

        <!-- Stat Item -->
        <div class="flex items-center">
          <!-- Icon -->
          <div class="rounded-full bg-[#6e46ff]/10 text-[#6e46ff] p-4">
            <IconBulbFilled size={24} />
          </div>
          <!-- /Icon -->
          <!-- Body -->
          <div class="self-stretch ml-2 py-2 space-y-1">
            <h1 class="text-xs font-medium">Size Utilization</h1>
            <p class="font-semibold">
              {formatNumber((100 * (lastBlock?.size ?? 0)) / 8e6)}%
            </p>
          </div>
          <!-- /Body -->
        </div>
        <!-- /Stat Item -->
      </div>
    </div>
  </div>
  <div class="flex-1">
    <MineAnimation bind:this={animation} />
  </div>
</div>
