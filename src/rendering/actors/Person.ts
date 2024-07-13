import { Math, GameObjects } from "phaser";

import { WrapSprite } from "./WrapSprite";
import { Transaction } from "~/common/types";
import type { Renderer } from "../Renderer";
import { PERSON_COLOR, PERSON_RADIUS } from "~/common/theme";
import { IVector2 } from "~/common/math";

export class Person extends WrapSprite<GameObjects.Arc> {
  private tx: Transaction;
  private visRenderer: Renderer;

  // Fields relating to currently executing move
  private isMoveActive: boolean;
  private lastIdleAt: Math.Vector2;
  private target: Math.Vector2;
  private moveHandle: number;

  constructor(renderer: Renderer, tx: Transaction) {
    super(renderer.getScene());
    this.tx = tx;
    this.visRenderer = renderer;

    this.isMoveActive = false;
    this.lastIdleAt = new Math.Vector2();
    this.target = new Math.Vector2();
    this.moveHandle = -1;

    super.buildSprite(
      this.scene.add.circle(
        //
        -1000,
        -1000,
        PERSON_RADIUS,
        PERSON_COLOR
      )
    );
  }

  public place(position: IVector2) {
    this.lastIdleAt.setFromObject(position);
    this.gameObject.copyPosition(position);
  }

  public moveTo(moveHandle: number, position: IVector2) {
    this.lastIdleAt.setFromObject(this.physicsBody.position);
    this.target.setFromObject(position);
    this.moveHandle = moveHandle;

    this.scene.physics.moveTo(
      this.gameObject,
      this.target.x,
      this.target.y,
      300, // TODO: No magic numbers
      1000
    );
    this.isMoveActive = true;
  }

  public moveToDeath(moveHandle: number) {
    this.moveTo(moveHandle, {
      x: this.physicsBody.position.x,
      y: -20
    });
  }

  private shouldStop(): boolean {
    let a = this.lastIdleAt.clone().subtract(this.target);
    let b = new Math.Vector2()
      .setFromObject(this.physicsBody.position)
      .subtract(this.target);

    return a.dot(b) <= 0;
  }

  private onMoveComplete() {
    this.isMoveActive = false;

    this.physicsBody.stop();
    this.lastIdleAt.setFromObject(this.physicsBody.position);

    this.visRenderer.onMoveComplete(this.moveHandle);
  }

  public update() {
    if (this.isMoveActive && this.shouldStop()) {
      this.onMoveComplete();
    }
  }
}
