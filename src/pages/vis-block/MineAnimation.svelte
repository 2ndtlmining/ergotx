<script lang="ts">
  import { onMount } from "svelte";
  import Phaser from "phaser";
  import { MineAnimationScene } from "./MineAnimationScene";
  import { AppEmitter } from "~/utils/events";

  let container: HTMLElement | null = null;
  let canvas: HTMLCanvasElement | null = null;

  let containerWidth: number = 0;
  let containerHeight: number = 0;

  let emitter = new AppEmitter<{ blockFound: void }>();

  export function playBlockFound() {
    emitter.emit('blockFound');
  }

  onMount(() => {
    // return;
    let game = new Phaser.Game({
      type: Phaser.CANVAS,
      canvas: canvas!,
      width: containerWidth,
      height: containerHeight,
      scene: new MineAnimationScene(emitter),
      backgroundColor: 0x563229,
      powerPreference: "high-performance",
      audio: { noAudio: true },
      banner: false
    });
  });
</script>

<div
  bind:this={container}
  class="w-full h-full"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  <canvas bind:this={canvas} />
</div>
