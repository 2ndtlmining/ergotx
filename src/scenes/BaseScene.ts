import Phaser from "phaser";
import { Time } from "~/common/Time";

export abstract class BaseScene extends Phaser.Scene {
  abstract getTitle(): string;

  // To be overridden by child classes
  public sceneUpdate() {}

  update(_currentTime: number, deltaTime: number) {
    Time.setDeltaTime(deltaTime);
    this.sceneUpdate();
  }

  public destroy() {}
}
