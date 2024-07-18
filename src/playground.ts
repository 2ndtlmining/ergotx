import "~/global.css";

import Phaser from "phaser";

import { SCENE_BG_COLOR } from "~/common/theme";
import { WorldManager } from "./rendering/WorldManager";

export class PlaygroundScene extends Phaser.Scene {
  preload() {
    WorldManager.preloadTiles(this.load);
  }

  create() {
    WorldManager.init(this);
    WorldManager.drawBackground(this);
  }

  update(time: number, delta: number): void {
    WorldManager.update(delta);
  }
}

let game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: 1200,
  height: window.innerHeight,
  autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  powerPreference: "high-performance",
  scene: PlaygroundScene,
  //   backgroundColor: SCENE_BG_COLOR,
  backgroundColor: 0x313131,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  audio: {
    noAudio: true
  }
});

(<any>window).game = game;
