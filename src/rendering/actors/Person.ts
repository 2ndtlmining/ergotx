import { GameObjects, Scene } from "phaser";

import { Transaction } from "~/common/types";
import { PERSON_COLOR, PERSON_RADIUS } from "~/common/theme";
import { IVector2 } from "~/common/math";

import { MotionController, SupportsMotion } from "~/movement/motion";

import { Actor } from "./Actor";
import { Transform } from "~/common/component-types";

export class Person extends Actor implements SupportsMotion {
  public readonly tx: Transaction;

  private gameObject: GameObjects.Arc;
  private motionController: MotionController;

  constructor(scene: Scene, tx: Transaction) {
    super(scene);
    this.tx = tx;

    this.gameObject = this.scene.add.circle(
      -1000,
      -1000,
      PERSON_RADIUS,
      PERSON_COLOR
    );

    this.gameObject.depth = 2;

    this.motionController = new MotionController(this.gameObject);
  }

  public place(position: IVector2) {
    this.gameObject.copyPosition(position);
  }

  public update() {
    this.motionController.update();
  }

  public destroy() {
    this.motionController.destroy();
    this.gameObject.destroy();
  }

  public getTransform(): Transform {
    return this.gameObject;
  }

  public getMotionController(): MotionController {
    return this.motionController;
  }
}
