import { Renderer } from "./Renderer";
import { WorldManager } from "./WorldManager";
import { BaseScene } from "../BaseScene";

import { PollUpdateService } from "~/ergoapi/PollUpdateService";
import { ReplayUpdateService } from "~/ergoapi/ReplayUpdateService";

import Controls from "./ui/Controls.svelte";
import { Engine } from "~/engine/Engine";
import { watchUpdates } from "~/ergoapi/watch-updates";
import { watchSettings } from "./DebugSettings";
import { SubscriptionSink } from "~/common/SubscriptionSink";

export class AirportScene extends BaseScene {
  private appRenderer: Renderer;
  private engine: Engine;
  private uiControls: Controls;

  private subSink: SubscriptionSink;

  getTitle(): string {
    return "Main";
  }

  preload() {
    WorldManager.preloadTiles(this.load);
    this.load.image("plane", "/planes/plane-2.png");

    this.load.image("house-01", "/houses/s1-house.png");
    this.load.image("house-02", "/houses/s2-house.png");
    this.load.image("house-03", "/houses/s3-house.png");
    this.load.image("house-04", "/houses/s4-house.png");
    this.load.image("house-05", "/houses/s5-house.png");
    this.load.image("house-06", "/houses/s6-house.png");
  }

  create() {
    this.subSink = new SubscriptionSink();

    WorldManager.init(this);

    this.uiControls = new Controls({
      target: document.getElementById("controls")!
    });

    this.subSink.manual(
      watchSettings(settings => {
        WorldManager.showGridLines(settings.showGridlines);
        WorldManager.showRegionsDebug(settings.debugRegions);
      })
    );

    // let updateService = new PollUpdateService();
    let updateService = new ReplayUpdateService("/replays/replay-01.json");

    this.appRenderer = new Renderer(this);
    this.engine = new Engine(this.appRenderer, updateService, false);

    this.subSink.event(this.engine, "mempool_updated", assembly => {
      let mempoolSize = assembly.transactions.length;
      this.appRenderer.setMempoolSize(mempoolSize);
    });

    this.subSink.event(this.engine, "block_found", () => {
      this.appRenderer.setNewBlockTime();
    });

    updateService.start();

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

  public destroy(): void {
    this.subSink.unsubscribeAll();
    this.uiControls.$destroy();
    this.engine.destroy();
    this.appRenderer.destroy();
  }
}
