import { Geom, GameObjects } from "phaser";
import uniqolor from "uniqolor";
import Color from "color";

import { GridManager } from "./GridManager";

export class Region {
  private _rect: Geom.Rectangle | null = null;

  constructor(
    public readonly startTileX: number,
    public readonly startTileY: number,
    public readonly numTilesX: number,
    public readonly numTilesY: number,
    public readonly debugName: string | undefined = "Region"
  ) {}

  public get rect() {
    if (!this._rect) {
      if (!GridManager.IsInitialized) {
        throw new Error(
          "Region.rect accessed before GridManager had initialized"
        );
      }
      this._rect = GridManager.getRegionRect(
        this.startTileX,
        this.startTileY,
        this.numTilesX,
        this.numTilesY
      );
    }

    return this._rect!;
  }
}

export const walkLane = new Region(4, 0, 1, 0, "Walk Lane");
export const waitingZone = new Region(8, 5.5, 2, 0, "Waiting Zone");
export const lineUpRoad = new Region(10, 5.5, 2, 0, "Line Up Road");

export class RegionsDebug {
  private static regionDebugDisplay: GameObjects.Group;

  public static init(scene: Phaser.Scene) {
    const allRegions = [walkLane, waitingZone, lineUpRoad];

    (<any>window).rd = this;
    (<any>window).allRegions = allRegions;

    this.regionDebugDisplay = scene.add.group();

    for (const region of allRegions) {
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

  public static showRegionsDebug(show: boolean) {
    this.regionDebugDisplay.setVisible(show);
  }
}
