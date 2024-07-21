import Phaser from "phaser";
import { Transform } from "~/common/component-types";

// export type ActorGameObject = Phaser.GameObjects.GameObject &
//   Phaser.GameObjects.Components.Transform &
//   Phaser.GameObjects.Components.Depth;

export abstract class Actor {
  protected scene: Phaser.Scene;
  // protected gameObject: T;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public abstract getTransform(): Transform;

  public getX() {
    return this.getTransform().x;
  }

  public getY() {
    return this.getTransform().y;
  }

  // protected buildSprite(gameObject: T) {
  //   this.gameObject = gameObject;
  // }

  // public getX() {
  //   return this.gameObject.x;
  // }

  // public getY() {
  //   return this.gameObject.y;
  // }

  // public getGameObject() {
  //   return this.gameObject;
  // }
}
