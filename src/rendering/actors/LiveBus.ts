import { GameObjects, Geom, Scene } from "phaser";
import { Actor } from "./Actor";
import { MotionController, SupportsMotion } from "~/movement/motion";
import { BUS_COLOR } from "~/common/theme";
import { IVector2 } from "~/common/math";

export class LiveBus extends Actor implements SupportsMotion {
  private motionController: MotionController;

  constructor(scene: Scene, width: number, height: number) {
    super(scene);

    super.buildSprite(
      this.scene.add
        .rectangle(-1000, -1000, width, height, BUS_COLOR)
        .setOrigin(0.5, 0)
    );

    // This needs to be done after the above call to buildSprite
    this.motionController = new MotionController(
      this.gameObject
      // this.scene.physics,
      // this.physicsBody
    );
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
