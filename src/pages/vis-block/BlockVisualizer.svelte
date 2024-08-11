<script lang="ts">
  import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
  import { onMount } from 'svelte';
  import { getBlocks, getBlocksAbove } from '~/ergoapi/apiconn'; 
  import type { Block } from '~/types/ergo';
  import { formatErg, formatNumber } from '~/utils/number';
  
  import { calculateScores, type Score } from './scores';
  
  // latest block at the end
  let blocks: Block[] = [];
  
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
    fetchNewBlocks().then((newBlocks) => {
      let totalBlocks = blocks.length + newBlocks.length;
      let extra = Math.max(0, totalBlocks - 720);
      
      blocks = [...blocks, ...newBlocks].slice(extra);
      // console.log(blocks);
    });
  }
  
  onMount(() => {
    updateBlocks();
    
    let taskId = setIntervalAsync(async () => {
      updateBlocks();
    }, 2 * 60 * 1000); // every 2 minutes
    
    return () => {
      clearIntervalAsync(taskId);
    }
  });
  
  // =====================

  let scores: Score[] = [];

  $: scores = calculateScores(blocks);
  
</script>

<div class="p-4 overflow-auto w-full">
  <div class="flex w-full overflow-x-auto">
    <table class="table-compact table-zebra table max-w-2xl">
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
              <svg class="spinner-ring" viewBox="25 25 50 50" stroke-width="5">
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
            <td>{formatNumber(100 * score.numBlocks / blocks.length, { mantissa: 2 })}%</td>
            <td>{formatErg(score.totalFee)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
