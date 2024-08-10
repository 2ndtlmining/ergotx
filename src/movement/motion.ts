import { Transform } from "~/scene/component-types";
import type { VoidCallback } from "~/types/utility";

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

  // Must be called after being attached to
  // a controller
  public run(): Promise<void> {
    return this.controller.startMotion(this);
  }
}

export class MotionController {
  public readonly gameObject: Transform;

  private currentMotion: Motion | null;
  private onComplete: VoidCallback<void>;

  constructor(gameObject: Transform) {
    this.gameObject = gameObject;
    this.currentMotion = null;
    this.onComplete = () => {};
  }

  public startMotion(motion: Motion): Promise<void> {
    if (this.currentMotion) {
      this.currentMotion._cancel();
      this.onComplete(); // TODO: should call onComplete ?
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

  public destroy() {
    if (this.currentMotion) {
      this.currentMotion._cancel();
      this.onComplete();
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
