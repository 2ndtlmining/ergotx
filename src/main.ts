import "~/global.css";

import Phaser from "phaser";

import { MainScene } from "./MainScene";
import { SCENE_BG_COLOR } from "~/common/theme";

let game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: 1100,
  height: window.innerHeight,
  canvas: document.getElementById("main_canvas")! as HTMLCanvasElement,
  powerPreference: "high-performance",
  scene: MainScene,
  backgroundColor: SCENE_BG_COLOR,
  audio: {
    noAudio: true
  }
});

Object.defineProperty(window, "fps", {
  get: function () {
    return game.loop.actualFps;
  }
});

(<any>window).game = game;
