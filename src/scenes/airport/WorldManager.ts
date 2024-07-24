import Phaser from "phaser";
import uniqolor from "uniqolor";
import Color from "color";

import { Region } from "./Region";
import { TILE_GRIDLINES_COLOR } from "~/common/theme";
import { Time } from "~/common/Time";
import { IVector2 } from "~/common/math";

export class WorldManager {
  private static isInitialized = false;
  public static get IsInitialized() {
    return this.isInitialized;
  }

  /* ========== Canvas ========== */

  private static canvasWidth = 0;
  private static canvasHeight = 0;

  public static get CanvasWidth() {
    return this.canvasWidth;
  }

  public static get CanvasHeight() {
    return this.canvasHeight;
  }

  private static numTilesX = 12;
  private static numTilesY = 0;

  private static tileSize = 0;

  public static get TileSize() {
    return this.tileSize;
  }

  public static get WorldMaxWidth() {
    return this.tileSize * this.numTilesX;
  }

  public static get WorldMaxHeight() {
    return this.tileSize * this.numTilesY;
  }

  /* ========== Gridlines ========== */
  private static gridlines: Phaser.GameObjects.Group;

  /* ========== Camera ========== */
  private static cameraControls: Phaser.Cameras.Controls.FixedKeyControl;

  /* ========== Regions ========== */
  private static homeRegion: Region;
  public static get HomeRegion() {
    return this.homeRegion;
  }

  private static walkLane: Region;
  public static get WalkLane() {
    return this.walkLane;
  }

  private static waitingZone: Region;
  public static get WaitingZone() {
    return this.waitingZone;
  }

  private static lineUpRoad: Region;
  public static get LineUpRoad() {
    return this.lineUpRoad;
  }

  private static flyOffRoad: Region;
  public static get FlyOffRoad() {
    return this.flyOffRoad;
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

  private static regionDebugDisplay: Phaser.GameObjects.Group;

  static preloadTiles(load: Phaser.Loader.LoaderPlugin) {
    load.image("hex", "/tiles/grass.png");
    load.image("floor_check", "/tiles/floor-check.png");
    load.image("floor_stone", "/tiles/floor-stone.png");
    load.image("grass", "/tiles/grass.png");
    load.image("road", "/tiles/road.png");
  }

  public static tileToWorld(tileX: number, tileY: number): IVector2 {
    let x = this.tileSize * tileX;
    let y = this.tileSize * tileY;
    return { x, y };
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
        image.setActive(false);
        image.setScale(scale, scale);
      }
    }
  }

  private static initCameraControls(scene: Phaser.Scene) {
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

  private static initGridLines(scene: Phaser.Scene) {
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
    this.waitingZone = new Region(9, 4, 1, 8, "Waiting Zone");
    this.lineUpRoad = new Region(10, 4, 2, 0, "Line Up Road");
    this.flyOffRoad = new Region(10, 0, 2, 4, "Fly Off Road");
  }

  private static initRegionsDebug(scene: Phaser.Scene) {
    this.regionDebugDisplay = scene.add.group();

    for (const region of this.AllRegions) {
      // let { x, y, width, height } = this.regionRect(region);

      let color = uniqolor(region.debugName ?? "").color;
      let colorInt = Color(color).rgbNumber();

      let rect = scene.add
        .rectangle(
          region.rect.x,
          region.rect.y,
          region.rect.width,
          region.rect.height,
          colorInt
        )
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
    this.initCameraControls(scene);
    this.initRegions();
    this.initRegionsDebug(scene);
    this.initGridLines(scene);
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
      if (region.rect.contains(x, y)) {
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
