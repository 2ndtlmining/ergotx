import Phaser, { Scenes } from "phaser";
import uniqolor from "uniqolor";
import Color from "color";

import { Region } from "./Region";
import { TILE_GRIDLINES_COLOR } from "~/common/theme";
import { Time } from "~/common/Time";
import { IVector2 } from "~/common/math";

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

  private static regionDebugDisplay: Phaser.GameObjects.Group;

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

  public static get AllRegions() {
    return [
      this.homeRegion,
      this.walkLane,
      this.waitingZone,
      this.lineUpRoad,
      this.flyOffRoad
    ];
  }

  public static get IsInitialized() {
    return this.isInitialized;
  }

  public static tileToWorld(tileX: number, tileY: number): IVector2 {
    let x = this.tileSize * tileX;
    let y = this.tileSize * tileY;
    return { x, y };
  }

  public static regionRect(region: Region) {
    let { x, y } = this.tileToWorld(region.startTileX, region.startTileY);

    let width =
      region.numTilesX > 0
        ? this.tileSize * region.numTilesX
        : this.WorldMaxWidth;

    let height =
      region.numTilesY > 0
        ? this.tileSize * region.numTilesY
        : this.WorldMaxHeight;

    return { x, y, width, height };
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
    this.homeRegion = new Region(0, 0, 4, 0, "Home");
    this.walkLane = new Region(4, 0, 1, 0, "Walk Lane");
    this.waitingZone = new Region(5, 4, 5, 0, "Waiting Zone");
    this.lineUpRoad = new Region(10, 4, 2, 0, "Line Up Road");
    this.flyOffRoad = new Region(10, 0, 2, 4, "Fly Off Road");
  }

  private static initRegionsDebug(scene: Phaser.Scene) {
    this.regionDebugDisplay = scene.add.group();

    for (const region of this.AllRegions) {
      let { x, y, width, height } = this.regionRect(region);

      let color = uniqolor.random().color;
      let colorInt = Color(color).rgbNumber();

      let rect = scene.add
        .rectangle(x, y, width, height, colorInt)
        .setOrigin(0, 0)
        .setAlpha(0.8)
        .setVisible(false)
        .setActive(false);

      rect.isStroked = true;
      rect.setStrokeStyle(4, 0x232323);

      this.regionDebugDisplay.add(rect);
    }
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
    this.initRegions();
    this.initRegionsDebug(scene);
    this.setupGridLines(scene);
    this.isInitialized = true;
  }

  static update() {
    this.cameraControls.update(Time.DeltaTime);
  }

  public static showGridLines(show: boolean) {
    this.gridlines.setVisible(show);
  }

  public static showRegionsDebug(show: boolean) {
    this.regionDebugDisplay.setVisible(show);
  }

  public static regionUnderCursor(scene: Phaser.Scene) {
    let x = scene.input.mousePointer.x;
    let y = scene.input.mousePointer.y;

    for (const region of this.AllRegions) {
      let { x: x1, y: y1, width, height } = this.regionRect(region);

      let x2 = x1 + width;
      let y2 = y1 + height;
      // console.log(x, y, x1, y1, x2, y2);
      // console.log(x2, y2);

      if (x1 <= x && x < x2 && y1 <= y && y < y2) {
        return region;
      }
    }

    return null;
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
