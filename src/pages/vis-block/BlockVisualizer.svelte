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

  // latest block at the end
  let blocks: Block[] = [];
  let lastBlockSeenTime = -1;
  let timeSinceLastBlock: string = "N/A";
  let stats = {
    difficulty: 889324518244352,
    hashRate: 8161565738708
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
      // console.log(blocks);
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
  <div class="flex gap-x-8 max-w-3xl">
    <TopStat loading={blocks.length == 0}>
      <IconHourglassLow class="text-[#0AD3FF]" size={64} />
      <p class="text-center text-sm">Time Since Last Block</p>
      <p class="mt-auto font-bold text-xl">{timeSinceLastBlock} s</p>
    </TopStat>
    <TopStat loading={statLoading}>
      <IconHash class="text-[#8ACB88]" size={64} />
      <p class="text-sm">Hash Rate</p>
      <p class="mt-auto font-bold text-xl">
        {formatNumber(stats.hashRate / 1e12)} TH/s
      </p>
    </TopStat>
    <TopStat loading={statLoading}>
      <IconWeight class="text-[#FFBF46]" size={64} />
      <p class="text-sm">Difficulty</p>
      <p class="mt-auto font-bold text-sm">{stats.difficulty}</p>
    </TopStat>
  </div>

  <div class="flex w-full overflow-x-auto mt-10">
    <table class="table-compact table-zebra table max-w-3xl">
      <thead>
        <tr>
          <th>Spot</th>
          <th>Wallet</th>
          <th>Blocks</th>
          <th>Percentage</th>
          <th>Fee</th>
        </tr>
      </thead>
      <tbody>
        {#if blocks.length == 0}
          <tr>
            <td colspan={5}>
              <div class="flex justify-center">
                <svg
                  class="spinner-ring"
                  viewBox="25 25 50 50"
                  stroke-width="3"
                >
                  <circle cx="50" cy="50" r="20" />
                </svg>
              </div>
            </td>
          </tr>
        {/if}
        {#each scores as score, index}
          <tr>
            <th>{index + 1}</th>
            <td>{score.miner.name}</td>
            <td>{score.numBlocks}</td>
            <td
              >{formatNumber((100 * score.numBlocks) / blocks.length, {
                mantissa: 2
              })}%</td
            >
            <td>{formatErg(score.totalFee)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
