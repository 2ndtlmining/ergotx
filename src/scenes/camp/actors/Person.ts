import { GameObjects, Scene, Events, Input, Math } from "phaser";

import { Transaction } from "~/common/types";
import { PERSON_COLOR, PERSON_RADIUS } from "~/common/theme";
import { IVector2 } from "~/common/math";
import { Transform } from "~/common/component-types";

import { MotionController, SupportsMotion } from "~/movement/motion";

import { createWindow } from "~/windows/SceneDecorations.svelte";

import { Actor } from "./Actor";

export class Person extends Actor implements SupportsMotion {
  public readonly tx: Transaction;

  private gameObject: GameObjects.Image;
  private motionController: MotionController;
  // private lastPosition: IVector2;

  constructor(scene: Scene, tx: Transaction) {
    super(scene);
    this.tx = tx;
    
    // this.lastPosition = { x: 0, y: 0 };

    let image = this.scene.add.image(-1000, -1000, "person");
    this.gameObject = image;
    
    image.setScale(2*PERSON_RADIUS / image.width);
    image.angle = 180;

    // -90 => right
    // +90 => left
    // 0 => down
    // 180 => up
    
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
    // this.lastPosition.x = position.x;
    // this.lastPosition.y = position.y;
    this.gameObject.copyPosition(position);
  }

  public update() {
    let beforePos: IVector2 = { x: this.getX(), y: this.getY() };
    this.motionController.update();
    let afterPos: IVector2 = { x: this.getX(), y: this.getY() };
    
  
    let radians = new Math.Vector2(
      afterPos.x - beforePos.x,
      afterPos.y - beforePos.y
    ).angle();
    
    this.gameObject.setRotation(radians);
    this.gameObject.angle -= 90;
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
