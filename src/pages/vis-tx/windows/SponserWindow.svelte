<script lang="ts">
  import { IconTrophyFilled } from "@tabler/icons-svelte";
  import { Confetti } from "svelte-confetti";

  export let contentType: 'ergo' | 'email';
</script>

<main class="relative">
  <div class="flex flex-col items-center px-4">
    <div class="text-[#09b573] p-4 bg-[#09b573]/30 rounded-full">
      <IconTrophyFilled size={70} />
    </div>

    <h3 class="font-semibold text-lg mt-4 text-center">
      Thank you for your support!
    </h3>
    
    <p class="text-center max-w-md mt-3">
      Your support means the world to us.
      {#if contentType == "ergo"}
        If you'd like to contribute, please donate to the following Ergo address:
      {:else}
        If you'd like to contribute, please reach out at the following email:
      {/if}
    </p>

    <p class="mt-5 addr text font-bold bg-black/20 p-4 rounded-md">
      {#if contentType == "ergo"}
        88dhgzEuTXaUPpNAbKL7UeNUFEcjkoqW6ev5P1hkynBmG4L5baYdZ8rSPYCDNmvwBLiJR7ABjndPhqGm
      {:else}
        sponser@ergotx.com
      {/if}
    </p>
  </div>
  
  <div class="absolute -top-8 left-0 right-0 h-32">
    <Confetti
      infinite
      y={[0, 0.1]}
      x={[-5, 5]}
      amount={150}
      fallDistance="170px"
      delay={[50, 1300]}
      duration={1700}
      size={15}
    /> 
  </div>
  
</main>

<style>
  .addr {
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
    word-break: break-all;
  }
</style>

