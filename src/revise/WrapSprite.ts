import Phaser from "phaser";

export class WrapSprite {
  protected scene: Phaser.Scene;
  protected gameObject: Phaser.GameObjects.GameObject;
  protected physicsBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  protected init(gameObject: Phaser.GameObjects.GameObject) {
    this.gameObject = gameObject;
    this.physicsBody = this.scene.physics.add.existing(gameObject).body as any;
  }

  public destroy() {
    this.gameObject.destroy();
  }
}