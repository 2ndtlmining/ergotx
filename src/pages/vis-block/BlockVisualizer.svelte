<script lang="ts">
  import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { getBlocks, getBlocksAbove } from '~/ergoapi/apiconn'; 
  import type { Block } from '~/types/ergo';
  
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
    
    /* let taskId = setIntervalAsync(async () => {
      updateBlocks();
    }, 2 * 60 * 1000); // every 2 minutes
    
    return () => {
      clearIntervalAsync(taskId);
    } */
  });
  
</script>

<div class="p-4">
  <div class="flex w-full overflow-x-auto">
    <table class="table-compact table-zebra table max-w-4xl">
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
        <tr>
          <th>1</th>
          <td>DxPool</td>
          <td>120</td>
          <td>16%</td>
          <td>$20</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
