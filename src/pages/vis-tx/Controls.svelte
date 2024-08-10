<script lang="ts">
  import { updateSettings } from "./DebugSettings";

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
  let updates = localStorage.getItem("updates") ?? "realtime";

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
  let showGridlines = false;
  $: updateSettings({ showGridlines });

  let debugRegions = false;
  $: updateSettings({ debugRegions });

  let debugBlockActors = false;
  $: updateSettings({ debugBlockActors });
</script>

<main>
  <p>
    FPS:
    {(Math.round(fps * 100) / 100).toFixed(2)}
  </p>

  <label class="mt-4 space-y-1">
    <p class="font-medium">Updates</p>
    <!--
    `on:change` must come after `bind:value` to ensure proper events ordering.
    @See here https://github.com/sveltejs/svelte/issues/4616#issuecomment-606593969
    -->
    <select
      class="select select-primary"
      bind:value={updates}
      on:change={() => {
        setAndReload("updates", updates);
      }}
    >
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
      <div>
        <button class="btn btn-success mt-3">Save Replay</button>
      </div>
    {/if}
  </div>

  <div class="mt-8">
    <h2 class="text-lg font-medium mb-3">Settings</h2>

    <label class="flex gap-3 text-sm mb-2">
      <input
        bind:checked={showGridlines}
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
    <label class="flex gap-3 text-sm mb-2">
      <input
        bind:checked={debugBlockActors}
        type="checkbox"
        class="switch switch-bordered-primary"
      />
      Debug Block Actors
    </label>
  </div>
</main>

<style lang="postcss">
  main {
    @apply p-4;
    font-family: "Fira Code";
  }
</style>
