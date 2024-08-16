import { GameObjects, Scene, Input, Math } from "phaser";

import { Transaction } from "~/types/ergo";
import { PERSON_RADIUS } from "~/constants/colors";
import { ThinVector } from "~/math/vector";
import { Transform } from "~/scene/component-types";

import { MotionController, SupportsMotion } from "~/movement/motion";

import { createWindow } from "../../Decorations.svelte";

import { Actor } from "./Actor";
import { Vector } from "~/math/vector";

export class Person extends Actor implements SupportsMotion {
  public readonly tx: Transaction;

  private gameObject: GameObjects.Image;
  private motionController: MotionController;

  constructor(scene: Scene, tx: Transaction) {
    super(scene);
    this.tx = tx;

    let image = this.scene.add.image(
      //
      -1000,
      -1000,
      "PersonA_Front-01"
    );
    this.gameObject = image;

    image.setScale((2 * PERSON_RADIUS) / image.width);

    image.setInteractive({ cursor: "pointer" });

    image.on(Input.Events.POINTER_UP, () => {
      // FIXME: too tight coupling + what should be the initial size and
      // position ?
      createWindow({
        details: { type: "tx", txId: tx.id },
        title: "Transaction Info",
        initialPosition: { x: 130, y: 130 },
        initialSize: { width: 450, height: 450 }
      });
    });

    image.depth = 2;

    this.motionController = new MotionController(this.gameObject);
  }

  public place(position: ThinVector) {
    this.gameObject.copyPosition(position);
  }

  public update() {
    // let beforePos = Vector.fromObject(this.getTransform());
    this.motionController.update();
    // let afterPos = Vector.fromObject(this.getTransform());

    // let rightAngle = -90; // angle at which the person is facing to right

    // // The vector in the Cartesian coordinate system in the direction of
    // // person's movement:
    // let displacement = afterPos.sub(beforePos);
    // displacement.y *= -1; // flip sign as y goes downwards in canvas

    // let angle: number;

    // if (displacement.lengthSq() !== 0) {
    //   // Phaser uses a clockwise angle system instead of anti clockwise so
    //   // we subtract the displacement's angle to go counter-clockwise
    //   angle = rightAngle - Math.RadToDeg(displacement.angle());
    // } else {
    //   // Face upwards by default if no movement occured
    //   angle = rightAngle - 90;
    // }

    // this.gameObject.setAngle(angle);
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
