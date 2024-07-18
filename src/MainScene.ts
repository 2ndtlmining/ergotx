import Phaser from "phaser";

import { Renderer } from "./rendering/Renderer";
import { WorldManager } from "./rendering/WorldManager";

export class MainScene extends Phaser.Scene {
  private visRenderer: Renderer;

  preload() {
    WorldManager.preloadTiles(this.load);
  }

  create() {
    WorldManager.init(this);
    WorldManager.drawBackground(this);

    this.visRenderer = new Renderer(this);
    console.log("STARTED");
  }

  update(_currentTime: number, deltaTime: number) {
    this.visRenderer.update(deltaTime);
    WorldManager.update(deltaTime);
  }
}
