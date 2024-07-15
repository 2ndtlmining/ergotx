import { GameObjects, Scene, Geom } from "phaser";
import { WrapSprite } from "./WrapSprite";
import { IVector2 } from "~/common/math";
import { MotionController, SupportsMotion } from "~/movement/motion";

export class Bus2
  extends WrapSprite<GameObjects.Rectangle>
  implements SupportsMotion
{
  private motionController: MotionController;

  constructor(scene: Scene) {
    super(scene);

    super.buildSprite(
      this.scene.add
        .rectangle(-1000, -1000, 100, 150, 0x553c69)
        .setOrigin(0.5, 0)
    );

    // This needs to be done after the above call to buildSprite
    this.motionController = new MotionController(
      this.scene.physics,
      this.physicsBody
    );
  }

  public getHeight() {
    return this.gameObject.height;
  }

  public getGameObject() {
    return this.gameObject;
  }

  public place(position: IVector2) {
    this.gameObject.copyPosition(position);
  }

  public update() {
    this.motionController.update();
  }

  public getMotionController(): MotionController {
    return this.motionController;
  }
}
