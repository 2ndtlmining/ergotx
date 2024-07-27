<script lang="ts" context="module">
  import type { VoidCallback } from "~/common/types";
  import type { IVector2 } from "~/common/math";

  import EventEmitter from "eventemitter3";

  interface WindowEntry {
    id: number;
    type: "stats" | "tx" | "block";
    initialPosition?: IVector2 | undefined | null;
  }

  interface WindowEvents {
    CreteWindow: VoidCallback<WindowEntry>;
  }

  const windowEmitter = new EventEmitter<WindowEvents>();

  let nextWindowId = 1;

  function buildWindow(
    winType: WindowEntry["type"],
    initialPosition?: IVector2
  ) {
    return {
      id: nextWindowId++,
      type: winType,
      initialPosition
    };
  }

  export function createWindow(winType: WindowEntry["type"]) {
    windowEmitter.emit("CreteWindow", buildWindow(winType));
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
    createWindow('stats');
  }}
>
  Stats
</button>
