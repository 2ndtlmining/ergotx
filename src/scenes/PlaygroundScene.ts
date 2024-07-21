import { WorldManager } from "~/rendering/WorldManager";
import { BaseScene } from "./BaseScene";
import { Time } from "~/common/Time";

export class PlaygroundScene extends BaseScene {
  getTitle(): string {
    return "Playground";
  }

  preload() {
    WorldManager.preloadTiles(this.load);
  }

  create() {
    WorldManager.init(this);
  }

  update(_currentTime: number, deltaTime: number) {
    Time.setDeltaTime(deltaTime);
    WorldManager.update();
  }
}
