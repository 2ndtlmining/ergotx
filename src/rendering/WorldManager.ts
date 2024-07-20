import Phaser, { Scenes } from "phaser";

import { Region } from "./Region";
import { TILE_GRIDLINES_COLOR } from "~/common/theme";
import { Time } from "~/common/Time";

export class WorldManager {
  private static isInitialized = false;

  private static canvasWidth = 0;
  private static canvasHeight = 0;

  private static numTilesX = 12;
  private static numTilesY = 0;

  private static tileSize = 0;

  /* ========== Gridlines ========== */
  private static gridlines: Phaser.GameObjects.Group;

  /* ========== Camera ========== */
  private static cameraControls: Phaser.Cameras.Controls.FixedKeyControl;

  /* ========== Regions ========== */
  private static homeRegion: Region;
  private static walkLane: Region;
  private static waitingZone: Region;
  private static lineUpRoad: Region;
  private static flyOffRoad: Region;

  static preloadTiles(load: Phaser.Loader.LoaderPlugin) {
    load.image("hex", "/tiles/grass.png");
    load.image("floor_check", "/tiles/floor-check.png");
    load.image("floor_stone", "/tiles/floor-stone.png");
    load.image("grass", "/tiles/grass.png");
    load.image("road", "/tiles/road.png");
  }

  public static get WorldMaxWidth() {
    return this.tileSize * this.numTilesX;
  }

  public static get WorldMaxHeight() {
    return this.tileSize * this.numTilesY;
  }

  public static get IsInitialized() {
    return this.isInitialized;
  }

  private static drawBackground(scene: Phaser.Scene) {
    const imageNames = ["hex", "floor_check", "floor_stone", "grass", "road"];

    for (let i = 0; i < this.numTilesY; ++i) {
      let row = level[Math.min(level.length - 1, i)];
      for (let j = 0; j < this.numTilesX; ++j) {
        let x = this.tileSize * j;
        let y = this.tileSize * i;

        let image = scene.add.image(x, y, imageNames[row[j]]).setOrigin(0, 0);
        let scale = this.tileSize / image.width;
        image.setScale(scale, scale);
      }
    }
  }

  private static setupCameraControls(scene: Phaser.Scene) {
    const cursors = scene.input.keyboard!.createCursorKeys();
    let camera = scene.cameras.main;

    this.cameraControls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera,
      up: cursors.up,
      down: cursors.down,
      speed: 1.75
    });

    camera.setBounds(0, 0, this.canvasWidth, this.WorldMaxHeight);
  }

  private static setupGridLines(scene: Phaser.Scene) {
    const lineWidth = 4;
    const halfWidth = lineWidth / 2;

    this.gridlines = scene.add.group();

    for (let i = 0; i < this.numTilesX - 1; ++i) {
      let nextX = this.tileSize * (i + 1);
      let x = nextX - halfWidth;
      let line = scene.add
        .rectangle(x, 0, lineWidth, this.WorldMaxHeight, TILE_GRIDLINES_COLOR)
        .setOrigin(0, 0)
        .setActive(false)
        .setVisible(false);

      this.gridlines.add(line);
    }

    for (let i = 0; i < this.numTilesY - 1; ++i) {
      let nextY = this.tileSize * (i + 1);
      let y = nextY - halfWidth;
      let line = scene.add
        .rectangle(0, y, this.WorldMaxWidth, lineWidth, TILE_GRIDLINES_COLOR)
        .setActive(false)
        .setOrigin(0, 0)
        .setActive(false)
        .setVisible(false);

      this.gridlines.add(line);
    }
  }

  private static initRegions() {
    this.homeRegion = new Region(0, 0, 4, 0);
    this.walkLane = new Region(4, 0, 1, 0);
    this.waitingZone = new Region(5, 4, 5, 0);
    this.lineUpRoad = new Region(10, 4, 2, 0);
    this.flyOffRoad = new Region(10, 0, 2, 4);
  }

  static init(scene: Phaser.Scene) {
    this.canvasWidth = +scene.game.config.width;
    this.canvasHeight = +scene.game.config.height;

    this.tileSize = Math.floor(this.canvasWidth / this.numTilesX);

    this.numTilesY = Math.max(
      Math.ceil(this.canvasHeight / this.tileSize) + 10,
      20
    );

    this.drawBackground(scene);
    this.setupCameraControls(scene);
    this.setupGridLines(scene);
    this.initRegions();
    this.isInitialized = true;
  }

  static update() {
    this.cameraControls.update(Time.DeltaTime);
  }

  public static showGridLines(show: boolean) {
    this.gridlines.setVisible(show);
  }
}

let level: number[][] = [
  [0, 0, 0, 0, 4, 1, 1, 1, 1, 1, 4, 4],
  [0, 0, 0, 0, 4, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 4, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 4, 1, 1, 3, 3, 3, 4, 4],
  [0, 0, 0, 0, 4, 2, 2, 2, 2, 2, 4, 4]
  /* The last row will be repeated */
];

(<any>window).WorldManager = WorldManager;
