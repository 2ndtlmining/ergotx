import { WorldManager } from "~/rendering/WorldManager";
import { BaseScene } from "./BaseScene";

export class PlaygroundScene extends BaseScene {

  getTitle(): string {
    return "Playground"
  }

  preload() {
    WorldManager.preloadTiles(this.load);
  }

  create() {
    WorldManager.init(this);
  }

  update(time: number, delta: number): void {
    WorldManager.update();
  }
}
