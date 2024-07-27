<script lang="ts" context="module">
</script>

<script lang="ts">
  import interact from "interactjs";
  import type { IRect, IVector2 } from "~/common/math";
  import { createEventDispatcher, onMount } from "svelte";

  export let initialPosition: IVector2 | null = null;
  export let initialSize: IRect | null = null;

  let dispatch = createEventDispatcher();

  let box: HTMLElement | null = null;
  let titleBar: HTMLElement | null = null;
  let interactInitialized = false;

  function requestFocus() {
    dispatch("focus");
  }

  function moveBy(dx: number, dy: number) {

    let element: HTMLElement = box!;

    let x = parseFloat(element.getAttribute("data-x") ?? "") || 0;
    let y = parseFloat(element.getAttribute("data-y") ?? "") || 0;

    x += dx;
    y += dy;

    element.style.transform = "translate(" + x + "px," + y + "px)";
    element.setAttribute("data-x", x.toString());
    element.setAttribute("data-y", y.toString());
  }

  function sizeTo(width: number, height: number) {
    let element: HTMLElement = box!;

    element.style.width = width + "px";
    element.style.height = height + "px";
  }

  onMount(() => {
    // To prevent this function from re-running during hot reload
    if (interactInitialized) {
      return;
    }

    interactInitialized = true;

    interact(box!)
      .resizable({
        inertia: true,
        edges: { left: true, right: true, bottom: true, top: false },

        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            outer: "parent"
          }),

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

      modifiers: [
        interact.modifiers.restrictRect({
          restriction: box?.parentElement!
        })
      ],

      listeners: {
        move: event => moveBy(event.dx, event.dy),
      }
    });

    if (initialPosition)
      moveBy(initialPosition.x, initialPosition.y);

    if (initialSize)
      sizeTo(initialSize.width, initialSize.height);
  });
</script>

<div
  bind:this={box}
  class="absolute left-0 top-0 flex flex-col bg-black w-40 h-40 border-2"
>
  <div bind:this={titleBar} class="h-10 w-full bg-purple-700"></div>
  <div class="flex-1 bg-red-500"></div>
</div>
