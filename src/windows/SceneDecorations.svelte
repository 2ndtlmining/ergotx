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

  export function createWindow(winType: WindowEntry["type"]) {
    windowEmitter.emit("CreteWindow", {
      id: nextWindowId++,
      type: winType
    });
  }
  (<any>window).createWindow = createWindow;
</script>

<script lang="ts">
  import FloatingWindow from "./FloatingWindow.svelte";
  import { onMount } from "svelte";

  let activeWindows: WindowEntry[] = [];

  onMount(() => {
    return windowEmitter.on("CreteWindow", entry => {
      activeWindows = [...activeWindows, entry];
    });
  });
</script>

{#each activeWindows as win (win.id)}
  <FloatingWindow />
{/each}
