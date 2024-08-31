<script lang="ts">
  import Home from "./pages/home/Home.svelte";
  import TxVisualizer from "./pages/vis-tx/TxVisualizer.svelte";
  import BlockVisualizer from "./pages/vis-block/BlockVisualizer.svelte";

  import { Router, Route } from "svelte-routing";
</script>

<Router>
  <Route path="/" component={Home} />
  <Route path="/tx" component={TxVisualizer} />
  <Route path="/blocks" component={BlockVisualizer} />
</Router>
