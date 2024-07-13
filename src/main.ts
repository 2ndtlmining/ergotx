import "~/global.css";

import Phaser from "phaser";

import { MainScene } from "./MainScene";
import { SCENE_BG_COLOR } from "~/common/theme";

let game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: 1200,
  height: window.innerHeight,
  autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  powerPreference: 'high-performance',
  scene: MainScene,
  backgroundColor: SCENE_BG_COLOR,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  }
});

(<any>window).game = game;
