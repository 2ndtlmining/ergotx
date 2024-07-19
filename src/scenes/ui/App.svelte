<script lang="ts">
  import Counter from "./Counter.svelte";
  let counter: Counter;

  export function increment() {
    counter.increment();
  }

</script>

<main>
  <Counter bind:this={counter} />
</main>
