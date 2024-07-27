<script lang="ts" context="module">
  import type { VoidCallback } from "~/common/types";
  import EventEmitter from "eventemitter3";

  interface WindowEntry {
    id: number; // uuid
    type: "stats" | "tx" | "block";
  }

  interface WindowEvents {
    CreteWindow: VoidCallback<WindowEntry>;
  }

  const windowEmitter = new EventEmitter<WindowEvents>();

  let nextWindowId = 1;

  function buildWindow(winType: WindowEntry["type"]) {
    return {
      id: nextWindowId++,
      type: winType
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

  let activeWindows: WindowEntry[] = [];

  onMount(() => {
    activeWindows = [
      buildWindow("stats"),
      buildWindow("stats"),
      buildWindow("stats"),
    ];
    return windowEmitter.on("CreteWindow", entry => {
      activeWindows = [...activeWindows, entry];
    });
  });
</script>

{#each activeWindows as win, index (win.id)}
  <FloatingWindow on:focus={() => {
    let entry = activeWindows.splice(index, 1)[0];
    activeWindows = [
      ...activeWindows,
      entry
    ];
  }} />
{/each}
