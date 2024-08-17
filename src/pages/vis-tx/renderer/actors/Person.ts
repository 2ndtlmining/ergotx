import { GameObjects, Scene, Input, Math } from "phaser";

import { Transaction } from "~/types/ergo";
import { PERSON_RADIUS } from "~/constants/colors";
import { ThinVector } from "~/math/vector";
import { Transform } from "~/scene/component-types";

import { MotionController, SupportsMotion } from "~/movement/motion";

import { createWindow } from "../../Decorations.svelte";

import { Actor } from "./Actor";
import { Vector } from "~/math/vector";

type Face = "Front" | "Side" | "Back";

export class Person extends Actor implements SupportsMotion {
  public readonly tx: Transaction;

  private personName: string;
  private personFrame = "01";

  private currentFace: Face = "Side";
  private isMirrored = false;

  private image: GameObjects.Image;
  private motionController: MotionController;

  constructor(scene: Scene, tx: Transaction, name: string) {
    super(scene);
    this.tx = tx;
    this.personName = name;

    let image = this.scene.add.image(
      //
      -1000,
      -1000,
      `${this.personName}_Front-${this.personFrame}`
    );
    this.image = image;

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

    this.motionController = new MotionController(this.image);
  }

  public place(position: ThinVector) {
    this.image.copyPosition(position);
  }

  public update() {
    if (this.motionController.IsPaused) {
      return;
    }

    let beforePos = Vector.fromObject(this.getTransform());
    this.motionController.update();
    let afterPos = Vector.fromObject(this.getTransform());

    // The vector in the standard Cartesian coordinate system, facing
    // the direction of person's movement:
    let displacement = afterPos.sub(beforePos);
    displacement.y *= -1; // flip sign as y goes downwards in canvas

    let face: "Front" | "Side" | "Back" = "Side";
    let mirror = false;

    if (displacement.lengthSq() > 0) {
      let angle = window.Math.round(Math.RadToDeg(displacement.angle()));
      angle = window.Math.round(angle / 90) * 90; // Round to a multiple of 90deg
      angle = ((angle % 360) + 360) % 360; // Get in the range [0, 360)

      if (angle === 0) {
        // right
        face = "Side";
      } else if (angle === 90) {
        // up
        face = "Back";
      } else if (angle === 180) {
        // left
        face = "Side";
        mirror = true;
      } else {
        // down
        face = "Front";
      }
    } else {
      face = "Back";
      mirror = false;
    }

    // Change face and mirror only if they changed from last frame
    if (face !== this.currentFace || this.isMirrored !== mirror) {
      this.image.setTexture(`${this.personName}_${face}-${this.personFrame}`);
      this.image.setFlipX(mirror);

      this.currentFace = face;
      this.isMirrored = mirror;
    }
  }

  public destroy() {
    this.motionController.destroy();
    this.image.destroy();
  }

  public getTransform(): Transform {
    return this.image;
  }

  public getMotionController(): MotionController {
    return this.motionController;
  }
}
