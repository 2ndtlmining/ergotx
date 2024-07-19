import Phaser from "phaser";

export abstract class BaseScene extends Phaser.Scene {
  abstract getTitle(): string;
}
