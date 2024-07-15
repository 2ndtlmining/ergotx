import Phaser from "phaser";

export type ActorGameObject = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.GetBounds;

export class Actor {
  protected scene: Phaser.Scene;
  protected gameObject: ActorGameObject;
  // protected gameObject: Phaser.GameObjects.GameObject;
  // protected physicsBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  protected buildSprite(gameObject: ActorGameObject) {
    this.gameObject = gameObject;
    // this.physicsBody = this.scene.physics.add.existing(gameObject).body as any;
  }

  public destroy() {
    this.gameObject.destroy();
  }

  public getX() {
    return this.gameObject.x;
  }

  public getY() {
    return this.gameObject.y;
  }

  public getGameObject() {
    return this.gameObject;
  }
}
