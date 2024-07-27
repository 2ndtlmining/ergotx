<script lang="ts">
  import interact from "interactjs";
  import { onMount } from "svelte";

  let box: HTMLElement | null = null;
  let titleBar: HTMLElement | null = null;

  onMount(() => {
    interact(box!).resizable({
      // resize from all edges and corners
      edges: { left: true, right: true, bottom: true, top: true },

      listeners: {
        move(event) {
          var target = event.target;
          var x = parseFloat(target.getAttribute("data-x")) || 0;
          var y = parseFloat(target.getAttribute("data-y")) || 0;

          // update the element's style
          target.style.width = event.rect.width + "px";
          target.style.height = event.rect.height + "px";

          // translate when resizing from top or left edges
          x += event.deltaRect.left;
          y += event.deltaRect.top;

          target.style.transform = "translate(" + x + "px," + y + "px)";

          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        }
      },
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

      inertia: true
    });

    interact(titleBar!).draggable({
      inertia: true,

      modifiers: [
        interact.modifiers.restrictRect({
          restriction: box?.parentElement!,
        })
      ],

      listeners: {
        // call this function on every dragmove event
        move: event => {
          var target = box!;

          // keep the dragged position in the data-x/data-y attributes
          var x = (parseFloat(target.getAttribute("data-x") ?? "") || 0) + event.dx;
          var y = (parseFloat(target.getAttribute("data-y") ?? "") || 0) + event.dy;

          // translate the element
          target.style.transform = "translate(" + x + "px, " + y + "px)";

          // update the posiion attributes
          target.setAttribute("data-x", x);
          target.setAttribute("data-y", y);
        }
      }
    });
  });
</script>

<div
  bind:this={box}
  class="absolute left-10 flex flex-col top-10 bg-black w-40 h-40"
>
  <div bind:this={titleBar} class="h-10 w-full bg-purple-700"></div>
  <div class="flex-1 bg-red-500"></div>
</div>
