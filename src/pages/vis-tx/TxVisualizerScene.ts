import { BaseScene } from "~/scene/BaseScene";
import { SubscriptionSink } from "~/utils/events";
import { isProduction } from "~/utils/index";

import { watchUpdates } from "./updates/watch-updates";
import type { UpdateService } from "./updates/UpdateService";
import { PollUpdateService } from "./updates/PollUpdateService";
import { ReplayUpdateService } from "./updates/ReplayUpdateService";

import { Engine } from "./engine/Engine";

import { Renderer } from "./renderer/Renderer";
import { GridManager } from "./renderer/GridManager";
import { WorldCamera } from "./renderer/WorldCamera";
import { RegionsDebug } from "./renderer/regions";
import { fixWidth, pixels } from "./renderer/sizing";

import { watchSettings } from "./DebugSettings";

export class CampScene extends BaseScene {
  private subSink: SubscriptionSink;

  private engine: Engine;
  private appRenderer: Renderer;

  getTitle(): string {
    return "Camp";
  }

  preload() {
    this.load.image("floor", "/army-assets/floor.png");

    this.load.image("road-single", "/army-assets/road-single.png");
    this.load.image("road-wide", "/army-assets/road-wide.png");

    this.load.image("tower1", "/army-assets/tower1.png");
    this.load.image("tower2", "/army-assets/tower2.png");

    this.load.image("car-horizontal", "/army-assets/car-horizontal.png");
    this.load.image("car-vertical", "/army-assets/car-vertical.png");

    this.load.image("hanger", "/army-assets/hanger.png");
    this.load.image("grill", "/army-assets/grill.png");

    this.load.image("house-1", "/army-assets/house-1.png");

    Renderer.preload(this.load);
  }

  create() {
    this.subSink = new SubscriptionSink();
    this.initVisuals();

    this.subSink.manual(
      watchSettings(settings => {
        GridManager.showGridLines(settings.showGridlines);
        RegionsDebug.showRegionsDebug(settings.debugRegions);
      })
    );

    let updateService: UpdateService;

    if (isProduction()) {
      updateService = new PollUpdateService();
    } else {
      // updateService = new PollUpdateService();
      updateService = new ReplayUpdateService("/replays/replay-01.json");
    }

    this.appRenderer = new Renderer(this);
    this.engine = new Engine(this.appRenderer, updateService, false);
    //
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

  public sceneUpdate(): void {
    // this.uiControls.setFps(this.game.loop.actualFps);

    WorldCamera.update();
    this.engine.update();
    this.appRenderer.update();
  }

  public destroy(): void {
    this.subSink.unsubscribeAll();
    // this.uiControls.$destroy();
    this.engine.destroy();
    this.appRenderer.destroy();
  }

  private initVisuals() {
    GridManager.init(this);
    WorldCamera.init(this);

    const fillCell = (
      tileX: number,
      tileY: number,
      size: number, // both numTilesX and numTilesY
      textureName: string,
      stretch: number = 0
    ) => {
      let rect = GridManager.getRegionRect(tileX, tileY, size, size);

      let image = this.add.image(rect.x, rect.y, textureName);
      image.setOrigin(0, 0);
      image.scaleX = rect.width / image.width;
      image.scaleY = rect.height / image.height + stretch;
    };

    const fillLineV = (
      tileX: number,
      tileY: number,
      size: number,
      textureName: string,
      stretch: number = 0
    ) => {
      for (let y = tileY; y < GridManager.NumTilesY; y += size) {
        fillCell(tileX, y, size, textureName, stretch);
      }
    };

    fillLineV(0, 0, 4, "floor");
    fillLineV(4, 0, 1, "road-single");
    fillLineV(5, 0, 5, "floor", 0.2);
    fillLineV(10, 0, 2, "road-wide");

    GridManager.bringGridToTop(this);
    RegionsDebug.init(this);

    GridManager.showGridLines(false);
    RegionsDebug.showRegionsDebug(false);

    this.addDecorations();
  }

  private addDecorations() {
    // towers
    {
      fixWidth(
        2,
        this.add
          .image(0, 0, "tower1")
          .setOrigin(0, 1)
          .setPosition(pixels(5.25), pixels(2.5))
      );

      fixWidth(
        2,
        this.add
          .image(0, 0, "tower2")
          .setOrigin(0, 1)
          .setPosition(pixels(7.75), pixels(2.5))
      );
    }

    // cars
    {
      fixWidth(
        1.75,
        this.add
          .image(0, 0, "car-horizontal")
          .setOrigin(0, 1)
          .setPosition(pixels(5.35), pixels(3.85))
      );

      fixWidth(
        1.75,
        this.add
          .image(0, 0, "car-horizontal")
          .setOrigin(0, 1)
          .setPosition(pixels(5.35), pixels(4.95))
      );

      fixWidth(
        1,
        this.add
          .image(0, 0, "car-vertical")
          .setOrigin(0, 1)
          .setPosition(pixels(7.75), pixels(5))
      );
    }

    // hanger
    {
      fixWidth(
        2.5,
        this.add
          .image(0, 0, "hanger")
          .setOrigin(0, 0)
          .setPosition(pixels(0.75), pixels(0.25))
      );
    }

    // grill
    {
      fixWidth(
        3,
        this.add
          .image(0, 0, "grill")
          .setOrigin(0, 1)
          .setPosition(pixels(5.25), GridManager.CanvasHeight + pixels(2))
      );
    }
  }
}
