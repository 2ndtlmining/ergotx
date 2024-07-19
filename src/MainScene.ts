import Phaser from "phaser";

import { Renderer } from "./rendering/Renderer";
import { WorldManager } from "./rendering/WorldManager";
import App from "./ui/App.svelte";

export class MainScene extends Phaser.Scene {
  private visRenderer: Renderer;

  preload() {
    WorldManager.preloadTiles(this.load);
  }

  init() {
    const app = new App({
      target: document.getElementById("controls_left")!
    });
  }

  create() {
    WorldManager.init(this);

    this.visRenderer = new Renderer(this);
    console.log("STARTED");
  }

  update(_currentTime: number, deltaTime: number) {
    this.visRenderer.update(deltaTime);
    WorldManager.update(deltaTime);
  }
}
