<script lang="ts" context="module">
  import type { VoidCallback } from "~/common/types";
  import type { IRect, IVector2 } from "~/common/math";

  import EventEmitter from "eventemitter3";

  // prettier-ignore
  type WindowDetails =
    | { type: "stats" }
    | { type: "tx" }
    | { type: "block" };

  interface WindowEntry {
    id: number;
    details: WindowDetails;
    initialPosition?: IVector2 | undefined | null;
    initialSize?: IRect | undefined | null;
  }

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
  import FloatingWindow from "./FloatingWindow.svelte";
  import { onMount } from "svelte";
  import clsx from "clsx";

  let activeWindows: WindowEntry[] = [];

  onMount(() => {
    activeWindows = [
      // buildWindow("stats", { x: 0, y: 0 })
      // buildWindow("stats"),
      // buildWindow("stats")
    ];
    return windowEmitter.on("CreteWindow", entry => {
      activeWindows = [...activeWindows, entry];
    });
  });
</script>

{#each activeWindows as win, index (win.id)}
  <FloatingWindow
    initialPosition={win.initialPosition}
    initialSize={win.initialSize}
    on:focus={() => {
      let entry = activeWindows.splice(index, 1)[0];
      activeWindows = [...activeWindows, entry];
    }}
  />
{/each}

<button
  class={clsx(
    "absolute left-2 bottom-2",
    "px-8 py-2 rounded",
    "bg-[#5C398F] hover:bg-[#392359] active:bg-[#462b6e]",
    "text-white font-medium text-lg tc"
  )}
  on:click={() => {
    if (activeWindows.find(win => win.details.type === "stats"))
      // Do not open a stats window if another one is open
      return;

    createWindow({
      details: { type: "stats" },
      initialPosition: { x: 150, y: -50 },
      initialSize: { width: 370, height: 370 }
    });
  }}
>
  Stats
</button>
