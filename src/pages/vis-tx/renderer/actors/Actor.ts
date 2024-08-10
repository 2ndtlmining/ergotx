import Phaser from "phaser";
import { Transform } from "~/scene/component-types";

export abstract class Actor {
  protected scene: Phaser.Scene;

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

  public destroy(): void {}
}
