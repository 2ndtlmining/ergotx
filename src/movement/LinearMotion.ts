import { Math } from "phaser";
import { IVector2 } from "~/common/math";

import { Motion } from "./motion";

export class LinearMotion extends Motion {
  private lastPoint: Math.Vector2;
  private nextPointIndex: number;

  constructor(public readonly points: IVector2[]) {
    super();
    this.lastPoint = new Math.Vector2();
    this.nextPointIndex = -1;
  }

  public _init() {
    this.lastPoint.setFromObject(this.controller.body.position);
    this.nextPointIndex = 0;

    this.shiftNext();
  }

  public _update() {
    if (this.shouldStop()) {
      this.nextPointIndex++;

      if (this.nextPointIndex >= this.points.length) {
        this.controller.body.stop();
        this.controller.completeCurrent();
      } else {
        this.shiftNext();
      }
    }
  }

  public _cancel() {
    this.controller.body.stop();
  }

  private shouldStop(): boolean {
    let nextPoint = this.points[this.nextPointIndex];
    let a = this.lastPoint.clone().subtract(nextPoint);
    let b = new Math.Vector2()
      .setFromObject(this.controller.body.position)
      .subtract(nextPoint);

    return a.dot(b) <= 0;
  }

  private shiftNext() {
    this.lastPoint.setFromObject(this.controller.body.position);
    let nextPoint = this.points[this.nextPointIndex];

    this.controller.physics.moveTo(
      this.controller.body.gameObject,
      nextPoint.x,
      nextPoint.y,
      300, // TODO: No magic numbers
      1000
    );
  }
}