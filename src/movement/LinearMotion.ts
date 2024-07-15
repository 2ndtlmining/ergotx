import { Math } from "phaser";
import { IVector2 } from "~/common/math";

import { Motion } from "./motion";

const SPEED = 0.5;
const MAX_DELTA_DIST = 2;

export class LinearMotion extends Motion {
  private lastPoint: Math.Vector2;
  private nextPointIndex: number;

  constructor(public readonly points: IVector2[]) {
    super();
    this.lastPoint = new Math.Vector2();
    this.nextPointIndex = -1;
  }

  public _init() {
    this.lastPoint.set(
      this.controller.gameObject.x,
      this.controller.gameObject.y
    );
    this.nextPointIndex = 0;
  }

  public _update(deltaTime: number): void {
    let source = this.controller.gameObject as IVector2;
    let destination = this.points[this.nextPointIndex];

    let direction = new Math.Vector2(
      destination.x - source.x,
      destination.y - source.y
    );

    let distToTarget = direction.length();

    let displacementLength = SPEED * deltaTime;
    let displacement = direction
      .clone()
      .normalize()
      .scale(displacementLength);

    if (distToTarget <= MAX_DELTA_DIST || displacementLength > distToTarget) {
      // go to next target, or stop
      this.nextPointIndex++;

      if (this.nextPointIndex >= this.points.length) {
        this.controller.gameObject.setX(destination.x);
        this.controller.gameObject.setY(destination.y);

        this.controller.completeCurrent();
        return;
      }
    }
    else {
      let nextPoint = new Math.Vector2().setFromObject(source).add(displacement);
      this.controller.gameObject.setX(nextPoint.x);
      this.controller.gameObject.setY(nextPoint.y);
    }
  }

  public _cancel(): void {
    /* Nothing to cancel */
  }
}
