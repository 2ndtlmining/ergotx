import Phaser from "phaser";

export class WrapSprite<T extends Phaser.GameObjects.GameObject> {
  protected scene: Phaser.Scene;
  protected gameObject: T;
  protected physicsBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  protected buildSprite(gameObject: T) {
    this.gameObject = gameObject;
    this.physicsBody = this.scene.physics.add.existing(gameObject).body as any;
  }

  public destroy() {
    this.gameObject.destroy();
  }
}