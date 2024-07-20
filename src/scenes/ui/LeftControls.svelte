<script lang="ts">
  import clsx from "clsx";
  import type { VoidCallback } from "~/common/types";
  import uniqcolor from "uniqolor";

  export let onShowGridlines: VoidCallback<boolean> | undefined;
  export let onDebugRegions: VoidCallback<boolean> | undefined;
  export let regionUnderCursor: () => string | null;

  function setAndReload(key: string, item: string) {
    if (item) {
      let oldVal = localStorage.getItem(key);
      localStorage.setItem(key, item);
      if (oldVal !== item) {
        window.location.reload();
      }
    }
  }

  // ============= FPS =============
  let fps = 0;
  export function setFps(newFps: number) {
    fps = newFps;
  }

  // ============= Update =============
  let updates = localStorage.getItem("updates") ?? "";
  $: setAndReload("updates", updates);

  // ============= Replays =============
  let recordingReplay = false;
  let replayAvailableForSave = false;

  function startRecordReplay() {
    recordingReplay = true;
  }

  function stopRecordReplay() {
    recordingReplay = false;
    replayAvailableForSave = true;
  }

  // ============= Settings =============

  // ==== Grid lines ====
  let showGridLines = false;
  $: onShowGridlines?.(showGridLines);

  // ==== Grid lines ====
  let debugRegions = false;
  $: onDebugRegions?.(debugRegions);

  // ============= Settings =============
  let hoveredRegion: string | null = null;
</script>

<svelte:document
  on:mousemove={debugRegions
    ? () => {
        hoveredRegion = regionUnderCursor();
      }
    : undefined}
/>

<main>
  <p>
    FPS:
    {(Math.round(fps * 100) / 100).toFixed(2)}
  </p>

  <label class="mt-4 space-y-1">
    <p class="font-medium">Updates</p>
    <select class="select select-primary" bind:value={updates}>
      <option value="realtime">Realtime</option>
      <option value="replay">Replay</option>
    </select>
  </label>

  <div class="mt-8">
    <h2 class="text-lg font-medium mb-3">Replay</h2>

    {#if recordingReplay}
      <button class="btn btn-outline-warning" on:click={stopRecordReplay}
        >Stop Recording</button
      >
    {:else}
      <button class="btn btn-primary" on:click={startRecordReplay}
        >Start Recording</button
      >
    {/if}

    {#if replayAvailableForSave}
      <button class="btn btn-success mt-3">Save Replay</button>
    {/if}
  </div>

  <div class="mt-8">
    <h2 class="text-lg font-medium mb-3">Settings</h2>

    <label class="flex gap-3 text-sm mb-2">
      <input
        bind:checked={showGridLines}
        type="checkbox"
        class="switch switch-bordered-primary"
      />
      Show gridlines
    </label>
    <label class="flex gap-3 text-sm mb-2">
      <input
        bind:checked={debugRegions}
        type="checkbox"
        class="switch switch-bordered-primary"
      />
      Debug Regions
    </label>
  </div>

  {#if debugRegions}
    <p class="mt-10">
      Region Under Cursor:
      <br />
      {hoveredRegion ?? "-none-"}
    </p>
  {/if}
</main>

<style lang="postcss">
  main {
    @apply p-4;
    font-family: "Fira Code";
  }
</style>
