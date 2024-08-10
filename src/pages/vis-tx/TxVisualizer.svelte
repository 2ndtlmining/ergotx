<script lang="ts">
  import { onMount } from "svelte";
  import { SCENE_BG_COLOR } from "~/constants/colors";

  let canvas: HTMLCanvasElement | null = null;

  function createGame(canvas: HTMLCanvasElement) {
    return new Phaser.Game({
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
  }

  onMount(() => {
    let game = createGame(canvas!);

    if (typeof window["fps"] === "undefined")
      Object.defineProperty(window, "fps", {
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
</div>
<!-- Controls -->
<div class="flex-1">Hello</div>

<style>
  :global(#root) {
    display: flex;
  }

  #canvas_container {
    position: relative;
    overflow: hidden;
  }
</style>
