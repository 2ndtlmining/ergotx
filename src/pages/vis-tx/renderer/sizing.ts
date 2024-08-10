import { GridManager } from "./GridManager";

export const tilesize = () => GridManager.TileSize;

export function pixels(tiles: number) {
  return GridManager.TileSize * tiles;
}

export function fixWidth(tiles: number, image: Phaser.GameObjects.Components.Size) {
  let imageWidth = image.width;
  let imageHeight = image.height;

  let aspectRatio = imageHeight / imageWidth;
  let newWidth = pixels(tiles);
  let newHeight = aspectRatio * newWidth;

  image.setDisplaySize(newWidth, newHeight);

  return image;
}
