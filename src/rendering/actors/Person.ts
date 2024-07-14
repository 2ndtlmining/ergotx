import { Math, GameObjects } from "phaser";

import { WrapSprite } from "./WrapSprite";
import { Transaction } from "~/common/types";
import type { Renderer } from "../Renderer";
import { PERSON_COLOR, PERSON_RADIUS } from "~/common/theme";
import { IVector2 } from "~/common/math";
import { LinearMotion, MotionController } from "~/movement/motion";

export class Person extends WrapSprite<GameObjects.Arc> {
  private tx: Transaction;
  // private visRenderer: Renderer;

  private motionController: MotionController;

  constructor(renderer: Renderer, tx: Transaction) {
    super(renderer.getScene());
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
      this.scene.physics,
      this.physicsBody
    );
  }

  public place(position: IVector2) {
    // this.lastIdleAt.setFromObject(position);
    this.gameObject.copyPosition(position);
  }

  public update() {
    this.motionController.update();
    // if (this.isMoveActive && this.shouldStop()) {
    //   this.onMoveComplete();
    // }
  }

  public createLinearMotion(points: IVector2[]) {
    return new LinearMotion(this.motionController, points);
  }
}
