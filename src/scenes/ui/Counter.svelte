<script lang="ts">
  let count: number = 0;

  export const increment = () => {
    count += 1;
  }
</script>

<button on:click={increment}>
  Count = {count}
</button>