// import { Math, Physics } from "phaser";
// import { IVector2 } from "~/common/math";
import { VoidCallback } from "~/common/types";
import { ActorGameObject } from "~/rendering/actors/Actor";

// type ArcadePhysics = Physics.Arcade.ArcadePhysics;
// type PhysicsBody = Physics.Arcade.Body;

export abstract class Motion {
  private _controller: MotionController | null;

  constructor() {
    this._controller = null;
  }

  public abstract _init(): void;
  public abstract _update(deltaTime: number): void;
  public abstract _cancel(): void;

  public attachTo(controller: MotionController) {
    this._controller = controller;
  }

  public get controller() {
    return this._controller!;
  }

  // Must be called after being attached to
  // a controller
  public run(): Promise<void> {
    return this.controller.startMotion(this);
  }
}

export class MotionController {
  // public readonly physics: ArcadePhysics;
  // public readonly body: PhysicsBody;
  public readonly gameObject: ActorGameObject;

  private currentMotion: Motion | null;
  private onComplete: VoidCallback<void>;

  constructor(gameObject: ActorGameObject) {
    // this.physics = physics;
    // this.body = body;
    this.gameObject = gameObject;
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

  public update(deltaTime: number) {
    if (this.currentMotion) {
      this.currentMotion._update(deltaTime);
    }
  }
}

export interface SupportsMotion {
  getMotionController(): MotionController;
}

export function attachMotion(target: SupportsMotion, motion: Motion) {
  let controller = target.getMotionController();
  motion.attachTo(controller);
  return motion;
}
