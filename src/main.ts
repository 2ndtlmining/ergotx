import "./styles/reset.css";
import "./styles/global.css";

import Phaser from "phaser";

import { SCENE_BG_COLOR } from "~/common/theme";

import type { BaseScene } from "./scenes/BaseScene";
import { AirportScene } from "./scenes/airport/AirportScene";
import { PlaygroundScene } from "./scenes/PlaygroundScene";
import { Constructor } from "./common/types";

let scene: Constructor<BaseScene>;
let pathname = window.location.pathname;

switch (pathname) {
  case "/p":
  case "/playground":
    scene = PlaygroundScene;
    break;

  default:
    scene = AirportScene;
}

let game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: 920,
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
