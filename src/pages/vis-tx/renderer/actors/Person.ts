import { GameObjects, Scene, Events, Input, Math } from "phaser";

import { Transaction } from "~/types/ergo";
import { PERSON_RADIUS } from "~/constants/colors";
import { IVector2 } from "~/math/vector";
import { Transform } from "~/scene/component-types";

import { MotionController, SupportsMotion } from "~/movement/motion";

import { createWindow } from "../../Decorations.svelte";

import { Actor } from "./Actor";

export class Person extends Actor implements SupportsMotion {
  public readonly tx: Transaction;

  private gameObject: GameObjects.Image;
  private motionController: MotionController;

  constructor(scene: Scene, tx: Transaction) {
    super(scene);
    this.tx = tx;

    let image = this.scene.add.image(-1000, -1000, "person");
    this.gameObject = image;

    image.setScale(2*PERSON_RADIUS / image.width);
    image.angle = 180;

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

  public place(position: IVector2) {
    this.gameObject.copyPosition(position);
  }

  public update() {
    let beforePos: IVector2 = { x: this.getX(), y: this.getY() };
    this.motionController.update();
    let afterPos: IVector2 = { x: this.getX(), y: this.getY() };

    let rightAngle = -90; // angle at which the person is facing to right

    // The vector in the Cartesian coordinate system in the direction of
    // person's movement:
    let displacement = new Math.Vector2(
      afterPos.x - beforePos.x,
      -(afterPos.y - beforePos.y) // flip sign as y goes downwards in canvas
    ).normalize();

    let angle: number;

    if (displacement.lengthSq() !== 0) {
      // Phaser uses a clockwise angle system instead of anti clockwise so
      // we subtract the displacement's angle to go counter-clockwise
      angle = rightAngle - Math.RadToDeg(displacement.angle());
    }
    else {
      // Face upwards by default if no movement occured
      angle = rightAngle - 90;
    }

    this.gameObject.setAngle(angle);
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
