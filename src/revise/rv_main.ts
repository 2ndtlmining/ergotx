import "~/global.css";

import Phaser from "phaser";

import { MainScene } from "./MainScene";

let _game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1200,
  height: window.innerHeight,
  autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  scene: MainScene,
  backgroundColor: 0x06303d,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  }
});
