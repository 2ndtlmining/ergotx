<script lang="ts">
  import { expoInOut } from "svelte/easing";
  import { flip } from "svelte/animate";

  import type { Block } from '~/types/ergo';
  import { formatErg, formatNumber } from "~/utils/number";

  import type { Score } from './scores';
  import { exploreAddressUrl } from "~/ergoapi/apiconn";

  export let blocks: Block[];
  export let scores: Score[];

</script>

<table class="table-compact table-zebra table">
  <thead>
    <tr>
      <th>Spot</th>
      <th>Miner</th>
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
            <svg class="spinner-ring" viewBox="25 25 50 50" stroke-width="3">
              <circle cx="50" cy="50" r="20" />
            </svg>
          </div>
        </td>
      </tr>
    {/if}
    {#each scores as score, index (score.minerId)}
      <tr animate:flip={{ duration: 450, easing: expoInOut }}>
        <th>{index + 1}</th>
        <td>
          <!-- {score.miner.name} -->
          <a
            class="link link-primary"
            target="_blank"
            href={exploreAddressUrl(score.miner.address)}
          >
            {score.miner.name}
          </a>
        </td>
        <td>{score.numBlocks}</td>
        <td>
          {formatNumber((100 * score.numBlocks) / blocks.length, {
            mantissa: 2
          })}%
        </td>
        <td>{formatErg(score.totalFee)}</td>
      </tr>
    {/each}
  </tbody>
</table>
