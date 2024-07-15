import Phaser from "phaser";

import { Renderer } from './rendering/Renderer';

export class MainScene extends Phaser.Scene {

  private visRenderer: Renderer;

  init() {
    this.visRenderer = new Renderer(this);
    console.log("STARTED");
  }

  update(_currentTime: number, deltaTime: number) {
    this.visRenderer.update(deltaTime);
  }
}