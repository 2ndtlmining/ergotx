<script>
  import {
    IconClockRecord,
    IconCurrencyDollar,
    IconHash,
    IconReceiptDollar,
    IconReplaceFilled,
    IconRosetteDiscountCheck,
  } from "@tabler/icons-svelte";
</script>

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
    <span class="value">N/A</span>
  </div>
</main>

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
