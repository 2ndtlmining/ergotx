import 'styles/reset.css';
import 'styles/load-fonts';
import 'styles/global.css';

import Application from "./Application.svelte";

const root = document.getElementById("root")!;

let app = new Application({
  target: root
});

export default app;

