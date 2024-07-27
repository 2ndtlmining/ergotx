import "./styles/reset.css";
import "./styles/global.css";

import Phaser from "phaser";
import whenDomReady from "when-dom-ready";

import { SCENE_BG_COLOR } from "~/common/theme";

import type { BaseScene } from "./scenes/BaseScene";
import { AirportScene } from "./scenes/airport/AirportScene";
import { PlaygroundScene } from "./scenes/PlaygroundScene";
import { Constructor } from "./common/types";
import SceneDecorations from "./windows/SceneDecorations.svelte";

let canvasContainer: HTMLElement | null = null;
let mainCanvas: HTMLCanvasElement | null = null;

function getScene(): Constructor<BaseScene> {
  let pathname = window.location.pathname;
  switch (pathname) {
    case "/p":
    case "/playground":
      return PlaygroundScene;

    default:
      return AirportScene;
  }
}

function createGame() {
  let game = new Phaser.Game({
    scene: getScene(),
    canvas: mainCanvas!,
    width: 920,
    height: window.innerHeight,
    backgroundColor: SCENE_BG_COLOR,
    type: Phaser.CANVAS,
    powerPreference: "high-performance",
    audio: { noAudio: true }
  });

  if (typeof window["fps"] === "undefined")
    Object.defineProperty(window, "fps", {
      get: function () {
        return game.loop.actualFps;
      }
    });

  return game;
}

whenDomReady(() => {
  canvasContainer = document.getElementById("canvas_container")!;
  mainCanvas = document.getElementById("main_canvas") as any;

  (<any>window).game = createGame();

  // This will append new content in `canvasContainer`. The mainCanvas
  // will be left intact
  new SceneDecorations({ target: canvasContainer });
});
