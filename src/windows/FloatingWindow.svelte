<script lang="ts" context="module">
  function moveBy(element: HTMLElement, dx: number, dy: number) {
    let x = parseFloat(element.getAttribute("data-x") ?? "") || 0;
    let y = parseFloat(element.getAttribute("data-y") ?? "") || 0;

    x += dx;
    y += dy;

    element.style.transform = "translate(" + x + "px," + y + "px)";
    element.setAttribute("data-x", x.toString());
    element.setAttribute("data-y", y.toString());
  }
</script>

<script lang="ts">
  import interact from "interactjs";
  import { createEventDispatcher, onMount } from "svelte";

  let dispatch = createEventDispatcher();

  function requestFocus() {
    dispatch("focus");
  }

  let box: HTMLElement | null = null;
  let titleBar: HTMLElement | null = null;

  onMount(() => {
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
            let target = box!;

            target.style.width = event.rect.width + "px";
            target.style.height = event.rect.height + "px";

            moveBy(target, event.deltaRect.left, event.deltaRect.top);
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
        move: event => moveBy(box!, event.dx, event.dy),
      }
    });
  });
</script>

<div
  bind:this={box}
  class="absolute left-10 flex flex-col top-10 bg-black w-40 h-40 border-2"
>
  <div bind:this={titleBar} class="h-10 w-full bg-purple-700"></div>
  <div class="flex-1 bg-red-500"></div>
</div>
