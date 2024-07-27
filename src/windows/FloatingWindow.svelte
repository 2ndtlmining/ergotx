<script lang="ts" context="module">
</script>

<script lang="ts">
  import interact from "interactjs";
  import type { IRect, IVector2 } from "~/common/math";
  import { createEventDispatcher, onMount } from "svelte";

  export let initialPosition: IVector2 | null = null;
  export let initialSize: IRect | null = null;

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

    interact(titleBar!).draggable({
      inertia: true,

      modifiers: [interact.modifiers.restrictRect({ restriction: container })],

      listeners: {
        move: event => moveBy(event.dx, event.dy)
      }
    });

    let { width: containerWidth, height: containerHeight } =
      container!.getBoundingClientRect();

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
  class="absolute left-0 top-0 flex flex-col bg-black w-40 h-40 border-2"
>
  <div bind:this={titleBar} class="h-10 w-full bg-purple-700"></div>
  <div
    class="flex-1 bg-red-500 p-2 text-black w-full overflow-hidden select-none"
  >
    <p>x = {currentX}</p>
    <p>y = {currentY}</p>
    <p>w = {currentWidth}</p>
    <p>h = {currentHeight}</p>
  </div>
</div>
