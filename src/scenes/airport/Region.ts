import { Geom } from "phaser";
import { WorldManager } from "./WorldManager";

export class Region {
  public readonly rect: Geom.Rectangle;

  constructor(
    public readonly startTileX: number,
    public readonly startTileY: number,
    public readonly numTilesX: number,
    public readonly numTilesY: number,
    public readonly debugName: string | undefined = "Region"
  ) {
    let { x, y } = WorldManager.tileToWorld(startTileX, startTileY);

    let width =
      numTilesX > 0
        ? WorldManager.TileSize * numTilesX
        : WorldManager.WorldMaxWidth;

    let height =
      numTilesY > 0
        ? WorldManager.TileSize * numTilesY
        : WorldManager.WorldMaxHeight;

    this.rect = new Geom.Rectangle(x, y, width, height);
  }
}
