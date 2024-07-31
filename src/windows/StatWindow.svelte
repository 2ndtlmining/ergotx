<script>
  import { IconClockRecord, IconCoinFilled, IconCopy, IconHash, IconReceiptDollar, IconReplaceFilled, IconRosetteDiscountCheckFilled } from "@tabler/icons-svelte";
</script>

<main>
  <div class="stat">
    <span class="icon">
      <IconCoinFilled />
    </span>
    <h4>Price</h4>
    <span class="value">43534</span>
  </div>

  <div class="stat">
    <span class="icon">
      <IconClockRecord />
    </span>
    <h4>Average Block times</h4>
    <span class="value">43534</span>
  </div>

  <div class="stat">
    <span class="icon">
      <IconHash />
    </span>
    <h4>Hashrate</h4>
    <span class="value">43534</span>
  </div>

  <div class="stat">
    <span class="icon">
      <IconReplaceFilled />
    </span>
    <h4>Circulating supply</h4>
    <span class="value">43534</span>
  </div>

  <div class="stat">
    <span class="icon">
      <IconReceiptDollar />
    </span>
    <h4>Average Fee</h4>
    <span class="value">43534</span>
  </div>

  <div class="stat">
    <span class="icon">
      <IconRosetteDiscountCheckFilled />
    </span>
    <h4>Total Transaction today</h4>
    <span class="value">43534</span>
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
    @apply font-bold;
  }
</style>
