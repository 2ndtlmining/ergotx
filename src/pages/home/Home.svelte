<script>
  import {
    IconAwardFilled,
    IconBrandFacebookFilled,
    IconBrandGithubFilled,
    IconBrandYoutubeFilled,
    IconCube3dSphere,
    IconMailFilled,
    IconPlayerTrackNextFilled
  } from "@tabler/icons-svelte";

  import { Link, navigate } from "svelte-routing";

  import * as contact from "@conf/contact";
  import Autolaunch, { getShouldAutolaunch } from "./Autolaunch.svelte";
  import { onMount } from "svelte";

  onMount(() => {
    if (getShouldAutolaunch()) {
      navigate("/tx", {
        replace: true
      });
    }
  });
</script>

<div class="w-72 shadow-lg shadow-[#887f7f]">
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
      <div class="menu-items">
        <Link to="/tx" class="menu-item">
          <IconAwardFilled />
          <span>Visualizer TX</span>
        </Link>

        <Link to="/blocks" class="menu-item">
          <IconCube3dSphere />
          <span>Visualizer Blocks</span>
        </Link>
      </div>
    </section>

    <section class="sidebar-footer p-4 h-full justify-end bg-gray-2">
      <div class="bg-[#807777]/20 p-4 rounded-md">
        <h1 class="text-white font-semibold text-sm">Follow Us</h1>

        <div class="mt-4 mb-2 flex items-start gap-x-2">
          <a
            href={contact.facebook}
            target="_blank"
            class="btn btn-sm btn-circle"
          >
            <IconBrandFacebookFilled size={20} />
          </a>
          <a
            href={contact.youtube}
            target="_blank"
            class="btn btn-sm btn-circle"
          >
            <IconBrandYoutubeFilled size={20} />
          </a>
          <a
            href={`mailto:${contact.email}`}
            target="_blank"
            class="btn btn-sm btn-circle"
          >
            <IconMailFilled size={20} />
          </a>
          <a
            href={contact.github}
            target="_blank"
            class="btn btn-sm btn-circle"
          >
            <IconBrandGithubFilled size={20} />
          </a>
        </div>
      </div>
    </section>
  </aside>
</div>

<div class="flex-1 relative overflow-y-auto pat">
  <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
    <div class="p-4 bg-[#5046461f] text-black flex flex-col">
      <Link to="/tx" class="btn btn-secondary btn-xl gap-x-4 mb-4">
        <span class="font-bold">Lauch</span>
        <IconPlayerTrackNextFilled size={28} />
      </Link>

      <Autolaunch />
    </div>
  </div>
</div>

<style>
  .pat {
    /* background-color: rgba(0, 0, 0); */
    background-color: rgba(41, 37, 37, 0.712);

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
