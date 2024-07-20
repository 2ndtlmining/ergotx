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
  {formattedFps}
</p>

<label class="mt-4 space-y-1">
  <p class="font-medium">Updates</p>
  <select class="select select-primary">
    <option>None</option>
    <option>Realtime</option>
    <option>Replay</option>
  </select>
</label>

<div class="mt-8">
  <h2 class="text-lg font-medium">
    Replay
  </h2>

<!--
  <button class="btn btn-primary mt-3">
    Start Recording
  </button> -->
  <!-- <button class="btn btn-outline-warning mt-3">
    Stop Recording
  </button> -->
  <button class="btn btn-success mt-3">
    Save Replay
  </button>
</div>