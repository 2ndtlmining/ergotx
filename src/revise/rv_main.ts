import "~/global.css";

import Phaser from "phaser";

import { MainScene } from "./MainScene";
import { SCENE_BG_COLOR } from "./theme";

let _game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1200,
  height: window.innerHeight,
  autoCenter: Phaser.Scale.Center.CENTER_BOTH,
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
