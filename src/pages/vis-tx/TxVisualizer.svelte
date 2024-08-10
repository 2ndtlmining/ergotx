<script lang="ts">
  import { onMount } from "svelte";
  import { SCENE_BG_COLOR } from "~/constants/colors";
  import type { BaseScene } from "~/scene/BaseScene";
  import { CampScene } from "./TxVisualizerScene";
  import Decorations from "./Decorations.svelte";
  import Controls from "./Controls.svelte";

  let canvas: HTMLCanvasElement | null = null;

  onMount(() => {
    let game = new Phaser.Game({
      scene: CampScene,
      canvas: canvas!,
      width: 920,
      height: window.innerHeight,
      backgroundColor: SCENE_BG_COLOR,
      type: Phaser.CANVAS,
      powerPreference: "high-performance",
      audio: { noAudio: true },
      banner: false
    });

    if (typeof window["fps"] === "undefined")
      Object.defineProperty(window, "fps", {
        configurable: true,
        get: function () {
          return game?.loop.actualFps;
        }
      });

    return () => {
      let baseScene = game.scene.getAt(0) as BaseScene;
      baseScene.destroy();
      game.destroy(false);
    };
  });
</script>

<div id="canvas_container">
  <canvas bind:this={canvas} id="main_canvas"></canvas>
  <Decorations />
</div>

<!-- Controls -->
<div class="flex-1">
  <Controls />
</div>

<style>
  :global(#root) {
    display: flex;
  }

  #canvas_container {
    position: relative;
    overflow: hidden;
  }
</style>
