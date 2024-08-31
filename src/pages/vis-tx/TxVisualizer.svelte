<script lang="ts">
  import { onMount } from "svelte";
  import { SCENE_BG_COLOR } from "~/constants/colors";
  import { CampScene } from "./TxVisualizerScene";
  import Decorations from "./Decorations.svelte";
  import Controls from "./Controls.svelte";

  let canvas: HTMLCanvasElement | null = null;

  onMount(() => {
    let scene = new CampScene();

    let game = new Phaser.Game({
      scene: scene,
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

    // scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, () => {
    //   console.log("Dwdadwa");
    // });

    return () => {
      scene.destroy();
      game.destroy(false);
    };
  });
</script>

<div class="flex-1 flex justify-center">
  <div id="canvas_container">
    <canvas bind:this={canvas} id="main_canvas"></canvas>
    <Decorations />
  </div>
</div>

<!-- Controls -->
<!-- <div class="flex-1">
  <Controls />
</div> -->

<style>
  #canvas_container {
    position: relative;
    overflow: hidden;
  }
</style>
