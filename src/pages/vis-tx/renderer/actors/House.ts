import { GameObjects, Scene } from "phaser";
import { ThinVector } from "~/math/vector";

// TODO: store the actual identity in this House class
export class House {
  private image: GameObjects.Image;
  private spawnPosition: ThinVector;

  constructor(
    scene: Scene,
    textureName: string,
    x: number,
    y: number,
    width: number
  ) {
    let image = (this.image = scene.add
      .image(x, y, textureName)
      .setOrigin(0, 1));

    image.scale = width / image.width;
    image.depth = 1;

    this.spawnPosition = {
      x: x + width / 2,
      y
    };
  }

  public getSpawnPosition() {
    return this.spawnPosition;
  }

  public destroy() {
    this.image.destroy();
  }
}
