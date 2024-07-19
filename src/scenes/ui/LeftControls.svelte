<script lang="ts">
  // let fpsContainerRef: HTMLElement;
  let fps = 0;

  let formattedFps: string;
  $: formattedFps = (Math.round(fps * 100) / 100).toFixed(2);

  export function setFps(newFps: number) {
    fps = newFps;
  }
</script>

<p>
  FPS:
  <strong>{formattedFps}</strong>
</p>