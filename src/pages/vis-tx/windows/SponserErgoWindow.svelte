<script>
  import { IconTrophyFilled } from "@tabler/icons-svelte";
  import { Confetti } from "svelte-confetti"
</script>

<main class="relative">
  <div class="flex flex-col items-center px-4">
    <div class="text-[#09b573] p-4 bg-[#09b573]/30 rounded-full">
      <IconTrophyFilled size={70} />
    </div>

    <h3 class="font-semibold text-lg mt-4 text-center">
      Thank you for your generosity!
    </h3>
    
    <p class="text-center max-w-sm mt-3">
      Your support means the world to us. If you'd like to contribute, please donate to the following Ergo address:
    </p>
  </div>
  
  <div class="absolute -top-8 left-0 right-0 h-32">
    <Confetti
      infinite
      y={[0, 0.1]}
      x={[-5, 5]}
      amount={100}
      fallDistance="170px"
      duration={1700}
      size={15}
    /> 
  </div>
  
</main>

