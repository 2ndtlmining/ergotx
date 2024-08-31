<script lang="ts">
  import TxVisualizer from "./pages/vis-tx/TxVisualizer.svelte";
  import BlockVisualizer from "./pages/vis-block/BlockVisualizer.svelte";
  import Home from "./pages/home/Home.svelte";

  import { Router, Link, Route } from "svelte-routing";
</script>

<Router>
  <!-- <Route>
    <div class="p-8 flex flex-col gap-y-4">
      <Link to="/tx" class="btn btn-outline-warning">Visualizer TX</Link>
      <Link to="/blocks" class="btn btn-outline-success">
        Visualizer Blocks
      </Link>
    </div>
  </Route> -->
  <Route path="/" component={Home} />
  <Route path="/tx" component={TxVisualizer} />
  <Route path="/blocks" component={BlockVisualizer} />
</Router>
