import "~/global.css";

import Phaser from "phaser";

import { SCENE_BG_COLOR } from "~/common/theme";

export class PlaygroundScene extends Phaser.Scene {
  preload() {
    this.load.image("hex", "/tiles/grass.png");
    this.load.image("floor_check", "/tiles/floor-check.png");
    this.load.image("floor_stone", "/tiles/floor-stone.png");
    this.load.image("grass", "/tiles/grass.png");
    this.load.image("road", "/tiles/road.png");
  }

  private fillTilesBackground() {
    const imageNames = ["hex", "floor_check", "floor_stone", "grass", "road"];

    let numTilesX = 12;
    let canvasWidth = +this.game.config.width;

    let tileSize = Math.floor(canvasWidth / numTilesX);

    for (let i = 0; i < level.length; ++i) {
      const row = level[i];
      for (let j = 0; j < row.length; ++j) {
        let x = tileSize * j;
        let y = tileSize * i;

        let image = this.add.image(x, y, imageNames[row[j]]).setOrigin(0, 0);
        let scale = tileSize / image.width;
        image.setScale(scale, scale);
      }
    }
  }

  create() {
    this.fillTilesBackground();
  }
}

let level: number[][] = [
  [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 4, 4],
  [0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
  [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4],
];

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
  }
});

(<any>window).game = game;

// */

/*

const cursors = this.input.keyboard!.createCursorKeys();

this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
  camera: this.cameras.main,
  left: cursors.left,
  right: cursors.right,
  up: cursors.up,
  down: cursors.down,
  speed: 0.25
});

this.cameras.main.setBounds(0, 0, 1400, 1400);
*/
