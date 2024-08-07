import "./styles/reset.css";
import "./styles/global.css";

import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";

import Phaser from "phaser";
import whenDomReady from "when-dom-ready";

import { SCENE_BG_COLOR } from "~/common/theme";

import type { BaseScene } from "./scenes/BaseScene";
import { AirportScene } from "./scenes/airport/AirportScene";
import { PlaygroundScene } from "./scenes/PlaygroundScene";
import { Constructor } from "./common/types";
import SceneDecorations from "./windows/SceneDecorations.svelte";
import { CampScene } from "./scenes/camp/CampScene";

let canvasContainer: HTMLElement | null = null;
let mainCanvas: HTMLCanvasElement | null = null;
let game: Phaser.Game | null = null;
let sceneDecorations: SceneDecorations | null = null;

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    if (game) {
      // destroy game
      let baseScene = game.scene.getAt(0) as BaseScene;
      baseScene.destroy();
      game.destroy(false);
    }

    if (sceneDecorations) {
      sceneDecorations.$destroy();
    }
  });
}

whenDomReady(() => {
  if (game) {
    // destroy game
    console.log("game destroy");
    let baseScene = game.scene.getAt(0) as BaseScene;
    baseScene?.destroy();
  }

  if (sceneDecorations) {
    console.log("scene destroy");
    sceneDecorations.$destroy();
  }

  canvasContainer = document.getElementById("canvas_container")!;
  mainCanvas = document.getElementById("main_canvas") as any;
  game = createGame();

  // This will append new content in `canvasContainer`. The mainCanvas
  // will be left intact
  sceneDecorations = new SceneDecorations({ target: canvasContainer });
});

function getScene(): Constructor<BaseScene> {
  let pathname = window.location.pathname;
  switch (pathname) {
    case "/p":
    case "/playground":
      return PlaygroundScene;

    case "/c":
      return CampScene;

    default:
      return AirportScene;
  }
}

function createGame() {
  return new Phaser.Game({
    scene: getScene(),
    canvas: mainCanvas!,
    width: 920,
    height: window.innerHeight,
    backgroundColor: SCENE_BG_COLOR,
    type: Phaser.CANVAS,
    powerPreference: "high-performance",
    audio: { noAudio: true },
    banner: false
  });
}

if (typeof window["fps"] === "undefined")
  Object.defineProperty(window, "fps", {
    get: function () {
      return game?.loop.actualFps;
    }
  });
