import { BaseScene } from "../BaseScene";
import { GridManager } from "./GridManager";
import { WorldCamera } from "./WorldCamera";

function pixels(tiles: number) {
  return GridManager.TileSize * tiles;
}

function fixWidth(tiles: number, image: Phaser.GameObjects.Image) {
  let imageWidth = image.width;
  let imageHeight = image.height;

  let aspectRatio = imageHeight / imageWidth;
  let newWidth = pixels(tiles);
  let newHeight = aspectRatio * newWidth;

  image.setScale(newWidth / imageWidth, newHeight / imageHeight);

  return image;
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
    
    this.load.image("car-horizontal", "/army-assets/car-horizontal.png");
    this.load.image("car-vertical", "/army-assets/car-vertical.png");
    
    this.load.image("hanger", "/army-assets/hanger.png");
    this.load.image("grill", "/army-assets/grill.png");
    
    this.load.image("house-1", "/army-assets/house-1.png");
  }

  create() {
    GridManager.init(this);
    WorldCamera.init(this);

    const fillCell = (
      tileX: number,
      tileY: number,
      size: number, // both numTilesX and numTilesY
      textureName: string,
      stretch: number = 0
    ) => {
      let rect = GridManager.getRegionRect(tileX, tileY, size, size);

      let image = this.add.image(rect.x, rect.y, textureName);
      image.setOrigin(0, 0);
      image.scaleX = rect.width / image.width;
      image.scaleY = rect.height / image.height + stretch;
    };

    const fillLineV = (
      tileX: number,
      tileY: number,
      size: number,
      textureName: string,
      stretch: number = 0
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

    // towers
    {
      fixWidth(
        2,
        this.add
          .image(0, 0, "tower1")
          .setOrigin(0, 1)
          .setPosition(pixels(5.25), pixels(2.5))
      );
    
      fixWidth(
        2,
        this.add
          .image(0, 0, "tower2")
          .setOrigin(0, 1)
          .setPosition(pixels(7.75), pixels(2.5))
      );
    }
    
    // cars
    {
      fixWidth(
        1.75,
        this.add
          .image(0, 0, "car-horizontal")
          .setOrigin(0, 1)
          .setPosition(pixels(5.35), pixels(3.85))
      );
      
      fixWidth(
        1.75,
        this.add
          .image(0, 0, "car-horizontal")
          .setOrigin(0, 1)
          .setPosition(pixels(5.35), pixels(4.95))
      );
      
      fixWidth(
        1,
        this.add
          .image(0, 0, "car-vertical")
          .setOrigin(0, 1)
          .setPosition(pixels(7.75), pixels(5))
      );
    }
    
    // hanger
    {
      fixWidth(
        3,
        this.add
          .image(0, 0, "hanger")
          .setOrigin(0, 0)
          .setPosition(pixels(0.5), pixels(0.25))
      );
    }
    
    
    // grill
    {
      fixWidth(
        3.5,
        this.add
          .image(0, 0, "grill")
          .setOrigin(0, 1)
          .setPosition(pixels(5.25), GridManager.CanvasHeight + pixels(2))
      );
    }
    
    // houses
    {
      fixWidth(
        1.625,
        this.add.image(0, 0, "house-1")
          .setOrigin(0, 1)
          .setPosition(pixels(0.25), pixels(9))
      );
      
      fixWidth(
        1.625,
        this.add.image(0, 0, "house-1")
          .setOrigin(0, 1)
          .setPosition(pixels(2.125), pixels(9))
      );
    }

    GridManager.bringGridToTop(this);
    GridManager.showGridLines(true);
  }

  public sceneUpdate(): void {
    WorldCamera.update();
  }
}
