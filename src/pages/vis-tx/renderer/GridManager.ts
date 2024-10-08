import Phaser, { Geom } from "phaser";

import { TILE_GRIDLINES_COLOR } from "~/constants/colors";
import type { ThinVector } from "~/math/vector";

export class GridManager {
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
  private static numTilesY = 24;

  private static tileSize = 0;

  public static get NumTilesX() {
    return this.numTilesX;
  }

  public static get NumTilesY() {
    return this.numTilesY;
  }

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

  public static tileToWorld(tileX: number, tileY: number): ThinVector {
    let x = this.tileSize * tileX;
    let y = this.tileSize * tileY;
    return { x, y };
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

  // Very temp
  public static bringGridToTop(scene: Phaser.Scene) {
    this.gridlines.getChildren().forEach(child => {
      scene.children.bringToTop(child);
    });
  }

  public static init(scene: Phaser.Scene) {
    this.canvasWidth = +scene.game.config.width;
    this.canvasHeight = +scene.game.config.height;

    this.tileSize = Math.floor(this.canvasWidth / this.numTilesX);

    this.initGridLines(scene);
    this.isInitialized = true;
  }

  public static showGridLines(show: boolean) {
    this.gridlines.setVisible(show);
  }

  public static getRegionRect(
    startTileX: number,
    startTileY: number,
    numTilesX: number,
    numTilesY: number
  ) {
    let { x, y } = this.tileToWorld(startTileX, startTileY);

    let width =
      numTilesX > 0 ? this.TileSize * numTilesX : this.WorldMaxWidth - x;

    let height =
      numTilesY > 0 ? this.TileSize * numTilesY : this.WorldMaxHeight - y;

    return new Geom.Rectangle(x, y, width, height);
  }
}

(<any>window).GridManager = GridManager;
