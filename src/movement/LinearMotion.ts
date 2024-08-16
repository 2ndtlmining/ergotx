import { Vector, ThinVector } from "~/math/vector";
import { Time } from "~/scene/Time";

import { Motion } from "./motion";

const MAX_DELTA_DIST = 2;
const SPEED = 0.45;
// const SPEED = 0.35;

export class LinearMotion extends Motion {
  private nextPointIndex: number;

  constructor(public readonly points: ThinVector[]) {
    super();
    this.nextPointIndex = -1;
  }

  public _init() {
    this.nextPointIndex = 0;
  }

  public _update(): void {
    let source = Vector.fromObject(this.controller.gameObject);
    let destination = this.points[this.nextPointIndex];

    let direction = Vector.fromObject(destination).subIp(source);
    let distToTarget = direction.length();

    let displacementLength = SPEED * Time.DeltaTime;

    if (distToTarget <= MAX_DELTA_DIST || displacementLength > distToTarget) {
      // go to next target, or stop
      this.nextPointIndex++;

      if (this.nextPointIndex >= this.points.length) {
        this.controller.gameObject.setX(destination.x);
        this.controller.gameObject.setY(destination.y);

        this.controller.completeCurrent();
        return;
      }
    } else {
      let displacement = direction.normalize().mul(displacementLength);
      let nextPoint = source.add(displacement);

      this.controller.gameObject.setX(nextPoint.x);
      this.controller.gameObject.setY(nextPoint.y);
    }
  }

  public _cancel(): void {
    /* Nothing to cancel */
  }
}
