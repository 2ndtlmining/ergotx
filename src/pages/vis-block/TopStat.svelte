<script>
  import clsx from "clsx";
  export let loading = false;
</script>

<div
  class={clsx(
    "flex flex-col justify-start items-center gap-y-2",
    "bg-[#1f1f1f] shadow-lg shadow-[#1c1b1b] rounded-lg",
    "px-10 py-6 flex-1",
    loading && "skeleton-pulse h-44"
  )}
>
  {#if !loading}
    <slot />
  {/if}
</div>
