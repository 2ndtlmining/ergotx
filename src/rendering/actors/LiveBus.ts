import { Geom, Scene } from "phaser";
import { Actor } from "./Actor";
import { MotionController, SupportsMotion } from "~/movement/motion";
import { IVector2 } from "~/common/math";

export class LiveBus extends Actor implements SupportsMotion {
  private motionController: MotionController;

  constructor(scene: Scene, width: number) {
    super(scene);

    {
      let image = this.scene.add.image(-1000, -1000, "plane");
      image.scale = width / image.width;
      image.setOrigin(0.5, 0);
    }

    this.gameObject.depth = 1;

    // This needs to be done after the above call to buildSprite
    this.motionController = new MotionController(this.gameObject);
  }

  public getHeight() {
    return this.gameObject.getBounds().height;
  }

  public place(position: IVector2) {
    this.gameObject.copyPosition(position);
  }

  public getWalkInTargetPoint() {
    // TODO: cache region (and update when moved) for faster
    // point calculation
    let allowedRegion = this.gameObject.getBounds();

    // TODO: inflate according to width and/or height
    Geom.Rectangle.Inflate(allowedRegion, -100, -100);
    return allowedRegion.getRandomPoint();
  }

  /* ============= */

  public update() {
    this.motionController.update();
  }

  public getMotionController(): MotionController {
    return this.motionController;
  }
}
