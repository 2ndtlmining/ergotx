import { GameObjects, Scene } from "phaser";

export class StatsDisplay {
  private rect: GameObjects.Rectangle;

  public blockTimeText: GameObjects.Text;
  public mempoolSizeText: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    let rect = (this.rect = scene.add
      .rectangle(x, y, width, height, 0x302c22)
      .setOrigin(0, 0));
    rect.depth = 3;

    rect.isStroked = true;
    rect.setStrokeStyle(2, 0xffffff);

    this.blockTimeText = scene.add
      .text(x + 15, y + 10, "", {
        color: "white",
        fontSize: 20
      })
      .setDepth(3);

    this.mempoolSizeText = scene.add
      .text(x + 15, y + 35, "", {
        color: "white",
        fontSize: 20
      })
      .setDepth(3);
  }

  public destroy() {
    this.rect.destroy();
  }
}
