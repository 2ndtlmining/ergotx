<script>
  import {
    IconAwardFilled,
    IconBrandFacebook,
    IconBrandFacebookFilled,
    IconBrandGithubFilled,
    IconBrandInstagram,
    IconBrandX,
    IconCube,
    IconCube3dSphere
  } from "@tabler/icons-svelte";
</script>

<div class="w-72 shadow-md shadow-black">
  <aside class="sidebar h-full justify-start">
    <section class="sidebar-title items-center p-4 pb-2">
      <div class="flex flex-col">
        <span>Ergo TX</span>
        <span class="text-xs font-normal text-content2">
          Live Ergo Chain Visualizer
        </span>
      </div>
    </section>

    <section class="sidebar-content h-fit min-h-[20rem] overflow-visible px-4">
      <ul class="menu-items">
        <li class="menu-item">
          <IconAwardFilled />
          <span>Visualizer TX</span>
        </li>

        <li class="menu-item">
          <IconCube3dSphere />
          <span>Visualizer Blocks</span>
        </li>
      </ul>
    </section>
    {#if true}
      <section class="sidebar-footer p-4 h-full justify-end bg-gray-2">
        <div class="bg-[#807777]/20 p-4 rounded-md">
          <h1 class="text-white font-semibold text-sm">Follow Us</h1>

          <div class="mt-4 mb-2 flex items-start gap-x-2">
            <a href="#" class="btn btn-sm btn-circle">
              <IconBrandFacebookFilled size={20} />
            </a>
            <a href="#" class="btn btn-sm btn-circle">
              <IconBrandInstagram size={20} />
            </a>
            <a href="#" class="btn btn-sm btn-circle">
              <IconBrandX size={20} />
            </a>
            <a href="#" class="btn btn-sm btn-circle">
              <IconBrandGithubFilled size={20} />
            </a>
          </div>
        </div>
      </section>
    {/if}
  </aside>
</div>

<div class="flex-1 overflow-y-auto pat"></div>

<style>
  .pat {
    background-color: rgb(0, 0, 0);
    opacity: 0.3;
    background-image: linear-gradient(
        30deg,
        #4c4848 12%,
        transparent 12.5%,
        transparent 87%,
        #4c4848 87.5%,
        #4c4848
      ),
      linear-gradient(
        150deg,
        #4c4848 12%,
        transparent 12.5%,
        transparent 87%,
        #4c4848 87.5%,
        #4c4848
      ),
      linear-gradient(
        30deg,
        #4c4848 12%,
        transparent 12.5%,
        transparent 87%,
        #4c4848 87.5%,
        #4c4848
      ),
      linear-gradient(
        150deg,
        #4c4848 12%,
        transparent 12.5%,
        transparent 87%,
        #4c4848 87.5%,
        #4c4848
      ),
      linear-gradient(
        60deg,
        #4c484877 25%,
        transparent 25.5%,
        transparent 75%,
        #4c484877 75%,
        #4c484877
      ),
      linear-gradient(
        60deg,
        #4c484877 25%,
        transparent 25.5%,
        transparent 75%,
        #4c484877 75%,
        #4c484877
      );
    background-size: 20px 35px;
    background-position:
      0 0,
      0 0,
      10px 18px,
      10px 18px,
      0 0,
      10px 18px;
  }
</style>
