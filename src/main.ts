import "~/global.css";

import Phaser from "phaser";

import { SCENE_BG_COLOR } from "~/common/theme";

import type { BaseScene } from "./scenes/BaseScene";
import { MainScene } from "./scenes/MainScene";
import { PlaygroundScene } from "./scenes/PlaygroundScene";

interface Newable<ReturnType> {
  new (...args: any[]): ReturnType;
}

let scene: Newable<BaseScene>;
let pathname = window.location.pathname;

switch (pathname) {
  case "/p":
  case "/playground":
    scene = PlaygroundScene;
    break;

  default:
    scene = MainScene;
}

let game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: 1100,
  height: window.innerHeight,
  canvas: document.getElementById("main_canvas")! as HTMLCanvasElement,
  powerPreference: "high-performance",
  scene: scene,
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
