import { Scene } from "phaser";

import { Transaction } from "~/common/types";
import { PERSON_COLOR, PERSON_RADIUS } from "~/common/theme";
import { IVector2 } from "~/common/math";

import { MotionController, SupportsMotion } from "~/movement/motion";

import { Actor } from "./Actor";

export class Person
  extends Actor
  implements SupportsMotion
{
  public readonly tx: Transaction;

  private motionController: MotionController;

  constructor(scene: Scene, tx: Transaction) {
    super(scene);
    this.tx = tx;

    super.buildSprite(
      this.scene.add.circle(
        //
        -1000,
        -1000,
        PERSON_RADIUS,
        PERSON_COLOR
      )
    );

    // This needs to be done after the above call to buildSprite
    this.motionController = new MotionController(
      this.gameObject,
      // this.scene.physics,
      // this.physicsBody
    );
  }

  public place(position: IVector2) {
    this.gameObject.copyPosition(position);
  }

  public update(deltaTime: number) {
    this.motionController.update(deltaTime);
  }

  public getMotionController(): MotionController {
    return this.motionController;
  }
}
