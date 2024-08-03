<script lang="ts" context="module">
  import type { VoidCallback } from "~/common/types";
  import type { WindowEntry } from "./win-types";

  import EventEmitter from "eventemitter3";

  interface WindowEvents {
    CreteWindow: VoidCallback<WindowEntry>;
  }

  const windowEmitter = new EventEmitter<WindowEvents>();

  let nextWindowId = 1;

  function buildWindow(windowData: Omit<WindowEntry, "id">) {
    return {
      id: nextWindowId++,
      ...windowData
    } as WindowEntry;
  }

  export function createWindow(windowData: Omit<WindowEntry, "id">) {
    windowEmitter.emit("CreteWindow", buildWindow(windowData));
  }

  (<any>window).createWindow = createWindow;
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import clsx from "clsx";
  import { IconChartAreaLineFilled } from "@tabler/icons-svelte";

  import { SubscriptionSink } from "~/common/SubscriptionSink";

  import FloatingWindow from "./FloatingWindow.svelte";
  import StatWindow from "./StatWindow.svelte";
  import TransactionWindow from "./TransactionWindow.svelte";

  let activeWindows: WindowEntry[] = [];

  onMount(() => {
    activeWindows = [];
    return SubscriptionSink.oneshot(windowEmitter, "CreteWindow", entry => {
      activeWindows = [...activeWindows, entry];
    });
  });
</script>

{#each activeWindows as winEntry, index (winEntry.id)}
  <FloatingWindow
    entry={winEntry}
    on:focus={() => {
      let entry = activeWindows.splice(index, 1)[0];
      activeWindows = [...activeWindows, entry];
    }}
    on:close={() => {
      activeWindows.splice(index, 1);
      activeWindows = activeWindows;
    }}
  >
    {#if winEntry.details.type === "stats"}
      <StatWindow />
    {:else if winEntry.details.type === "tx"}
       <TransactionWindow txId={winEntry.details.txId} />
    {:else if winEntry.details.type === "block"}
      Block info
    {/if}
  </FloatingWindow>
{/each}

<button
  class={clsx(
    "absolute left-2 bottom-2",
    "px-5 py-2 rounded-md",
    "bg-[#5C398F] hover:bg-[#392359] active:bg-[#462b6e]",
    "text-white font-medium text-lg tc",
    "flex items-center gap-x-2"
  )}
  on:click={() => {
    if (activeWindows.find(win => win.details.type === "stats"))
      // Do not open a stats window if another one is open
      return;

    createWindow({
      title: "Stats",
      details: { type: "stats" },
      initialPosition: { x: 150, y: -50 },
      initialSize: { width: 470, height: 370 }
    });
  }}
>
  <IconChartAreaLineFilled />
  Stats
</button>
