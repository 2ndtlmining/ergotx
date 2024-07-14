import { Math, Physics } from "phaser";
import { IVector2 } from "~/common/math";
import { VoidCallback } from "~/common/types";

type ArcadePhysics = Physics.Arcade.ArcadePhysics;
type PhysicsBody = Physics.Arcade.Body;

export abstract class Motion {
  private _controller: MotionController | null;

  constructor() {
    this._controller = null;
  }

  public abstract _init(): void;
  public abstract _update(): void;
  public abstract _cancel(): void;

  public attachTo(controller: MotionController) {
    this._controller = controller;
  }

  public get controller() {
    return this._controller!;
  }

  public start(): Promise<void> {
    return this.controller.startMotion(this);
  }
}

export class MotionController {
  public readonly physics: ArcadePhysics;
  public readonly body: PhysicsBody;

  private currentMotion: Motion | null;
  private onComplete: VoidCallback<void>;

  constructor(physics: ArcadePhysics, body: PhysicsBody) {
    this.physics = physics;
    this.body = body;
    this.currentMotion = null;
    this.onComplete = () => {};
  }

  public startMotion(motion: Motion): Promise<void> {
    if (this.currentMotion) {
      this.currentMotion._cancel();
      // TODO: call onComplete ?
    }

    this.currentMotion = motion;

    return new Promise(resolve => {
      this.onComplete = resolve;
      motion._init();
    });
  }

  public completeCurrent() {
    this.currentMotion = null;
    this.onComplete();
    this.onComplete = () => {};
  }

  public update() {
    if (this.currentMotion) {
      this.currentMotion._update();
    }
  }
}

export class LinearMotion extends Motion {
  private lastPoint: Math.Vector2;
  private nextPointIndex: number;

  constructor(
    public readonly points: IVector2[]
  ) {
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

export interface SupportsMotion {
  getMotionController(): MotionController;
}

export async function runMotion(target: SupportsMotion, motion: Motion) {
  let controller = target.getMotionController();
  motion.attachTo(controller);

  return motion.start();
}
