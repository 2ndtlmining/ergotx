import { Math, Physics } from "phaser";
import { IVector2 } from "~/common/math";
import { VoidCallback } from "~/common/types";

type ArcadePhysics = Physics.Arcade.ArcadePhysics;
type PhysicsBody = Physics.Arcade.Body;

// class Motion {
//   constructor(
//     public readonly body: PhysicsBody,
//     public readonly points: IVector2[]
//   ) {}
// }

class MotionController {
  private physics: ArcadePhysics;
  private body: PhysicsBody;

  // Sequence to follow in the current motion
  private currentSequence: IVector2[];

  // The last point from which a shift started
  private lastPoint: Math.Vector2;

  // index of the next target point, or -1 if not moving
  private nextPointIndex: number;

  // Is the body currently moving
  private isMoving: boolean;

  // Called when the current motion has ended
  private onComplete: VoidCallback<void>;

  constructor(physics: ArcadePhysics, body: PhysicsBody) {
    this.physics = physics;
    this.body = body;

    this.currentSequence = [];
    this.lastPoint = new Math.Vector2();
    this.nextPointIndex = -1;
    this.isMoving = false;
    this.onComplete = () => {};
  }

  public startMotion(points: IVector2[], onComplete: VoidCallback<void>) {
    // TODO: do not allow empty array for points
    this.body.stop();

    this.currentSequence = [...points];
    this.lastPoint.setFromObject(this.body.position);
    this.nextPointIndex = 0;
    this.isMoving = true;
    this.onComplete = onComplete;

    this.shiftNext();
  }

  public update() {
    if (this.isMoving) {
      if (this.shouldStop()) {
        this.nextPointIndex++;

        if (this.nextPointIndex >= this.currentSequence.length) {
          this.isMoving = false;
          this.body.stop();
          this.onComplete();
        } else {
          this.shiftNext();
        }
      }
    }
  }

  private shouldStop(): boolean {
    let nextPoint = this.currentSequence[this.nextPointIndex];
    let a = this.lastPoint.clone().subtract(nextPoint);
    let b = new Math.Vector2()
      .setFromObject(this.body.position)
      .subtract(nextPoint);

    return a.dot(b) <= 0;
  }

  private shiftNext() {
    this.lastPoint.setFromObject(this.body.position);
    let nextPoint = this.currentSequence[this.nextPointIndex];

    this.physics.moveTo(
      this.body.gameObject,
      nextPoint.x,
      nextPoint.y,
      300, // TODO: No magic numbers
      1000
    );
  }
}

interface SupportsMotion {
  getMotionController(): MotionController;
}

// class Dot implements SupportsMotion {
//   private motionController: MotionController;

//   constructor() {
//     this.motionController = new MotionController(this.physicsBody);
//   }

//   getMotionController(): MotionController {
//     return this.motionController;
//   }

//   update() {
//     this.motionController.update();
//   }
// }
