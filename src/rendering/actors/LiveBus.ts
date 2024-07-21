import { Geom, Scene, GameObjects } from "phaser";
import { MotionController, SupportsMotion } from "~/movement/motion";
import { IVector2 } from "~/common/math";
import { Actor } from "./Actor";
import { Transform } from "~/common/component-types";

export class LiveBus extends Actor implements SupportsMotion {
  private container: GameObjects.Container;
  private sprite: GameObjects.Image;
  private height: number;

  private motionController: MotionController;
  constructor(scene: Scene, width: number) {
    super(scene);

    {
      let sprite = this.sprite = this.scene.add.image(0, 0, "plane");
      sprite.scale = width / sprite.width;
      sprite.setOrigin(0.5, 0);
      this.height = sprite.getBounds().height;

      this.container = scene.add.container(-1000, -1000);
      this.container.add(sprite);
    }

    this.container.depth = 1;

    this.motionController = new MotionController(this.container);
  }

  public getHeight() {
    return this.height;
  }

  public place(position: IVector2) {
    this.container.copyPosition(position);
  }

  public getWalkInTargetPoint() {
    // TODO: cache region (and update when moved) for faster
    // point calculation
    let allowedRegion = this.sprite.getBounds();

    Geom.Rectangle.Inflate(allowedRegion, -100, -100);
    return allowedRegion.getRandomPoint();
  }

  /* ============= */

  public update() {
    this.motionController.update();
  }

  public destroy() {
    this.container.destroy();
  }

  public getTransform(): Transform {
    return this.container;
  }

  public getMotionController(): MotionController {
    return this.motionController;
  }
}
