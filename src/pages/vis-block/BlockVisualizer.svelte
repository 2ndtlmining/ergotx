<script lang="ts">
  import { clearIntervalAsync, setIntervalAsync } from "set-interval-async";
  import { onMount } from "svelte";
  import {
    getBlocks,
    getBlocksAbove,
    getNetworkStats
  } from "~/ergoapi/apiconn";
  import type { Block } from "~/types/ergo";
  import { formatErg, formatNumber, parseNumber } from "~/utils/number";

  import { calculateScores, type Score } from "./scores";
  import {
    IconCube,
    IconHash,
    IconHourglassLow,
    IconWeight
  } from "@tabler/icons-svelte";
  import clsx from "clsx";
  import TopStat from "./TopStat.svelte";
  import { expoInOut } from "svelte/easing";
  import { flip } from "svelte/animate";
  import MineAnimation from "./MineAnimation.svelte";
  import AllStats from "./AllStats.svelte";
  import RankTable from "./RankTable.svelte";

  // latest block at the end
  let blocks: Block[] = [];
  let lastBlockSeenTime = -1;
  let timeSinceLastBlock: string = "N/A";
  let stats = {
    difficulty: -1,
    hashRate: -1
  };
  let statLoading = false;

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

  onMount(() => {
    statLoading = true;
    return;

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
    let blockFetcherId = setIntervalAsync(updateBlocks, 2 * 60 * 1000); // every 2 minutes

    // Block timer
    updateTimeSinceLastBlock();
    let blockTimerId = setInterval(updateTimeSinceLastBlock, 1000); // every second;

    return () => {
      clearIntervalAsync(blockFetcherId);
      clearInterval(blockTimerId);
    };
  });

  // =====================

  let scores: Score[] = [];

  $: scores = calculateScores(blocks);
</script>

<div class="p-4 overflow-auto w-full">
  <AllStats
    {blocks}
    {timeSinceLastBlock}
    {statLoading}
    difficulty={stats.difficulty}
    hashRate={stats.hashRate}
  />
  <!-- <div class="flex w-full overflow-x-auto gap-x-12 items-start mt-10"> -->
    <RankTable {blocks} {scores} />
  <!-- </div> -->
</div>
