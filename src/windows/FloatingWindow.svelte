<script lang="ts" context="module">
</script>

<script lang="ts">
  import interact from "interactjs";
  import clsx from "clsx";
  import { createEventDispatcher, onMount } from "svelte";

  import { IconX } from "@tabler/icons-svelte";

  import type { WindowEntry } from "./win-types";

  export let entry: WindowEntry;

  let dispatch = createEventDispatcher();

  let container: HTMLElement | null = null;
  let box: HTMLElement | null = null;
  let titleBar: HTMLElement | null = null;
  let interactInitialized = false;

  let currentX = 0;
  let currentY = 0;
  let currentWidth = 0;
  let currentHeight = 0;

  function requestFocus() {
    dispatch("focus");
  }

  function closeWindow() {
    dispatch("close");
  }

  function moveBy(dx: number, dy: number) {
    let element: HTMLElement = box!;

    let x = parseFloat(element.getAttribute("data-x") ?? "") || 0;
    let y = parseFloat(element.getAttribute("data-y") ?? "") || 0;

    x += dx;
    y += dy;

    currentX = x;
    currentY = y;

    element.style.transform = "translate(" + x + "px," + y + "px)";
    element.setAttribute("data-x", x.toString());
    element.setAttribute("data-y", y.toString());
  }

  function sizeTo(width: number, height: number) {
    let element: HTMLElement = box!;

    currentWidth = width;
    currentHeight = height;

    element.style.width = width + "px";
    element.style.height = height + "px";
  }

  onMount(() => {
    // To prevent this function from re-running during hot reload
    if (interactInitialized) {
      return;
    }

    interactInitialized = true;

    container = box?.parentElement!;

    interact(box!)
      .resizable({
        inertia: true,
        edges: { left: true, right: true, bottom: true, top: false },

        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({ outer: container }),

          // minimum size
          interact.modifiers.restrictSize({
            min: { width: 100, height: 50 }
          })
        ],

        listeners: {
          move(event) {
            sizeTo(event.rect.width, event.rect.height);
            moveBy(event.deltaRect.left, event.deltaRect.top);
          }
        }
      })
      .on("pointerdown", () => {
        requestFocus();
      });

    interact(titleBar!)
      .draggable({
        inertia: true,
        ignoreFrom: "[data-title-action]",
        modifiers: [
          interact.modifiers.restrictRect({ restriction: container })
        ],

        listeners: {
          move: event => moveBy(event.dx, event.dy)
        }
      })
      .on("click", event => {
        let target = event.target as HTMLElement | null;
        if (target && target.hasAttribute("data-title-action")) {
          closeWindow();
        }
      });

    let { width: containerWidth, height: containerHeight } =
      container!.getBoundingClientRect();

    let { initialPosition, initialSize } = entry;

    if (initialPosition) {
      let { x, y } = initialPosition;

      if (x < 0) x += containerWidth - (initialSize?.width || 0);
      if (y < 0) y += containerHeight - (initialSize?.height || 0);

      moveBy(x, y);
    }

    if (initialSize) {
      let { width, height } = initialSize;
      width = Math.min(width, containerWidth - currentX);
      height = Math.min(height, containerHeight - currentY);

      sizeTo(width, height);
    }
  });
</script>

<div
  bind:this={box}
  class={clsx(
    "absolute left-0 top-0",
    "flex flex-col overflow-hidden",
    "rounded-md border-2 shadow-md shadow-[#282829] border-[#0B0E13]"
  )}
>
  <div
    bind:this={titleBar}
    class={clsx(
      "h-10 w-full bg-[#0B0E13] shrink-0 select-none",
      "flex items-center px-4"
    )}
  >
    <h3 class="font-medium text-lg">{entry.title}</h3>
    <span class="flex-1" />
    <button
      class={clsx(
        "p-1 rounded-full tc",
        "bg-[#272727] hover:bg-[#4b4b4b] active:bg-[#272727]"
      )}
    >
      <IconX data-title-action="close" size={20} />
    </button>
  </div>

  <div class="flex-1 bg-[#232B40] p-4 w-full select-none overflow-hidden">
    <slot></slot>
    <!-- <p>x = {currentX}</p>
    <p>y = {currentY}</p>
    <p>w = {currentWidth}</p>
    <p>h = {currentHeight}</p> -->
  </div>
</div>
