import { Renderer } from "~/rendering/Renderer";
import { WorldManager } from "~/rendering/WorldManager";
import { BaseScene } from "./BaseScene";

import App from "./ui/App.svelte";
import { Time } from "~/common/Time";

export class MainScene extends BaseScene {
  private visRenderer: Renderer;

  getTitle(): string {
    return "Main"
  }

  preload() {
    WorldManager.preloadTiles(this.load);
  }

  // init() {
  //   const app = new App({
  //     target: document.getElementById("controls_left")!
  //   });
  // }

  create() {
    WorldManager.init(this);

    this.visRenderer = new Renderer(this);
    console.log("STARTED");
  }

  update(_currentTime: number, deltaTime: number) {
    Time.setDeltaTime(deltaTime);
    WorldManager.update();

    this.visRenderer.update();
  }
}
