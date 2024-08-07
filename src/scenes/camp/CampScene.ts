import { BaseScene } from "../BaseScene";
import { GridManager } from "./GridManager";
import { WorldCamera } from "./WorldCamera";

function pixels(tiles: number) {
  return GridManager.TileSize * tiles;
}

export class CampScene extends BaseScene {
  getTitle(): string {
    return "Camp";
  }
  
  preload() {
    this.load.image("floor", "/army-assets/floor.png");
    this.load.image("road-single", "/army-assets/road-single.png");
    this.load.image("road-wide", "/army-assets/road-wide.png");
    this.load.image("tower1", "/army-assets/tower1.png");
    this.load.image("tower2", "/army-assets/tower2.png");
  }
  
  create() {
    GridManager.init(this);
    WorldCamera.init(this);
    GridManager.showGridLines(true);
    
    const fillCell = (
      tileX: number,
      tileY: number,
      size: number, // both numTilesX and numTilesY
      textureName: string,
      stretch: number = 0,
    ) => {
      let rect = GridManager.getRegionRect(tileX, tileY, size, size);

      let image = this.add.image(rect.x, rect.y, textureName);
      image.setOrigin(0, 0);
      image.scaleX = rect.width / image.width;
      image.scaleY = rect.height / image.height + stretch;
    }

    const fillLineV = (
      tileX: number,
      tileY: number,
      size: number,
      textureName: string,
      stretch: number = 0,
    ) => {
      for (let y = tileY; y < GridManager.NumTilesY; y += size) {
        fillCell(tileX, y, size, textureName, stretch);
      }
    };
 
    fillLineV(0, 0, 4, "floor");
    fillLineV(4, 0, 1, "road-single");
    fillLineV(5, 0, 5, "floor", 0.2);
    fillLineV(10, 0, 2, "road-wide");
    
    // ======
  }

  public sceneUpdate(): void {
    WorldCamera.update();
  }
}

