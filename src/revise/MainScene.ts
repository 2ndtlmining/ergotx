import Phaser, { Geom, Math, Scene, Input, Scale, GameObjects } from "phaser";

import { Renderer } from './rv_renderer';

// let renderer = new Renderer();
// renderer.init();

export class MainScene extends Phaser.Scene {

  private visRenderer: Renderer;

  init() {
    this.visRenderer = new Renderer();
    this.visRenderer.init();
    console.log("STARTED");
  }

  update() {
    this.visRenderer.update();
  }
}