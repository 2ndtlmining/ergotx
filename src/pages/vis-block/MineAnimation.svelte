<script lang="ts">
  import { onMount } from "svelte";
  import { SCENE_BG_COLOR } from "~/constants/colors";
  import Phaser from 'phaser';
  import { MineAnimationScene } from './MineAnimationScene';

  let container: HTMLElement | null = null;
  let canvas: HTMLCanvasElement | null = null;

  onMount(() => {
    return;
    let game = new Phaser.Game({
      type: Phaser.CANVAS,
      canvas: canvas!,
      // width: 320,
      // height: 320,
      scene: new MineAnimationScene(),
      scale: {
        mode: Phaser.Scale.FIT,
        parent: container,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 100,
        height: 200
      },
      backgroundColor: SCENE_BG_COLOR,
      powerPreference: "high-performance",
      audio: { noAudio: true },
      banner: false,
    });
  });
</script>

<div bind:this={container}>
  <canvas bind:this={canvas} />
</div>
