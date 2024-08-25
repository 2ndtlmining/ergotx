<script lang="ts">
  import { IconHash, IconHourglassLow, IconWeight } from "@tabler/icons-svelte";
  import { formatNumber } from "~/utils/number";
  import type { Block } from "~/types/ergo";

  import TopStat from "./TopStat.svelte";

  export let blocks: Block[];
  export let timeSinceLastBlock: string;
  export let statLoading: boolean;
  export let difficulty: number;
  export let hashRate: number;

</script>

<div class="flex gap-x-8">
  <TopStat loading={blocks.length == 0}>
    <IconHourglassLow class="text-[#0AD3FF]" size={64} />
    <p class="text-center text-sm">Time Since Last Block</p>
    <p class="mt-auto font-bold text-xl">{timeSinceLastBlock} s</p>
  </TopStat>
  <TopStat loading={statLoading}>
    <IconHash class="text-[#8ACB88]" size={64} />
    <p class="text-sm">Hash Rate</p>
    <p class="mt-auto font-bold text-xl">
      {formatNumber(hashRate / 1e12)} TH/s
    </p>
  </TopStat>
  <TopStat loading={statLoading}>
    <IconWeight class="text-[#FFBF46]" size={64} />
    <p class="text-sm">Difficulty</p>
    <p class="mt-auto font-bold text-sm">{difficulty}</p>
  </TopStat>
</div>
