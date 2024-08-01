import { Renderer } from "./Renderer";
import { WorldManager } from "./WorldManager";
import { BaseScene } from "../BaseScene";

import { PollUpdateService } from "~/ergoapi/PollUpdateService";
import { ReplayUpdateService } from "~/ergoapi/ReplayUpdateService";

import Controls from "./ui/Controls.svelte";
import { Engine } from "~/engine/Engine";
import { watchUpdates } from "~/ergoapi/watch-updates";
import { watchSettings } from "./DebugSettings";

export class AirportScene extends BaseScene {
  private appRenderer: Renderer;
  private engine: Engine;
  private uiControls: Controls;

  getTitle(): string {
    return "Main";
  }

  preload() {
    WorldManager.preloadTiles(this.load);
    this.load.image("plane", "/planes/plane-2.png");
  }

  create() {
    WorldManager.init(this);

    this.uiControls = new Controls({
      target: document.getElementById("controls")!,
    });

    watchSettings((settings) => {
      WorldManager.showGridLines(settings.showGridlines);
      WorldManager.showRegionsDebug(settings.debugRegions);
    });

    let updateService = new PollUpdateService();
    // let updateService = new ReplayUpdateService("/replays/replay-01.json");

    this.appRenderer = new Renderer(this);
    this.engine = new Engine(this.appRenderer, updateService);

    (<any>window).r = this.appRenderer;
    (<any>window).e = this.engine;
    (<any>window).w = watchUpdates(updateService);
  }

  sceneUpdate() {
    this.uiControls.setFps(this.game.loop.actualFps);

    WorldManager.update();
    this.engine.update();
    this.appRenderer.update();
  }
}
