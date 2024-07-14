import { GameObjects, Scene, Geom } from "phaser";

import { WrapSprite } from "./WrapSprite";

export class Bus extends WrapSprite<GameObjects.Rectangle> {
  private stayRegion: Geom.Rectangle;

  constructor(scene: Scene, region: Geom.Rectangle, label: string) {
    super(scene);

    this.stayRegion = Geom.Rectangle.Inflate(Geom.Rectangle.Clone(region), -100, -100);

    super.buildSprite(
      this.scene.add
        .rectangle(
          region.x,
          region.y,
          region.width,
          region.height,
          0x553c69
        )
        .setOrigin(0, 0)
    );

    this.scene.add
      .text(region.x + 4, region.y + 4, label)
      .setOrigin(0, 0);
  }

  public getRandomPoint() {
    return this.stayRegion.getRandomPoint();
  }
}
