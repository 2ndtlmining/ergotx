import "./styles/reset.css";
import "./styles/global.css";

import Phaser from "phaser";
import whenDomReady from 'when-dom-ready';

import { SCENE_BG_COLOR } from "~/common/theme";

import type { BaseScene } from "./scenes/BaseScene";
import { AirportScene } from "./scenes/airport/AirportScene";
import { PlaygroundScene } from "./scenes/PlaygroundScene";
import { Constructor } from "./common/types";

async function createGame() {
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

  await whenDomReady();

  let canvasContainer = document.getElementById("canvas_container")!;
  let canvas = document.getElementById("main_canvas")! as HTMLCanvasElement;

  let canvasHeight = canvasContainer.getBoundingClientRect().height;

  let game = new Phaser.Game({
    scene,
    canvas: canvas!,
    width: 920,
    height: canvasHeight,
    backgroundColor: SCENE_BG_COLOR,
    type: Phaser.CANVAS,
    powerPreference: "high-performance",
    audio: { noAudio: true },
  });

  if (typeof window["fps"] === "undefined")
    Object.defineProperty(window, "fps", {
      get: function () {
        return game.loop.actualFps;
      }
    });

  (<any>window).game = game;
}

createGame();