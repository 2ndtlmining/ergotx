import { Renderer } from "~/rendering/Renderer";
import { WorldManager } from "~/rendering/WorldManager";
import { BaseScene } from "./BaseScene";
import { Time } from "~/common/Time";

import Controls from "./ui/Controls.svelte";
import { updateSettings } from "~/rendering/DebugSettings";
import { Engine } from "~/engine/Engine";

export class MainScene extends BaseScene {
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
      props: {
        onShowGridlines: shouldShow => {
          WorldManager.showGridLines(shouldShow);
        },
        onDebugRegions: shouldShow => {
          WorldManager.showRegionsDebug(shouldShow);
        },
        regionUnderCursor: () => {
          return WorldManager.regionUnderCursor(this)?.debugName ?? null;
        },
        onDebugBus: shouldShow => {
          updateSettings(settings => {
            settings.debugBus = shouldShow;
          });
        }
      }
    });

    this.appRenderer = new Renderer(this);
    this.engine = new Engine(this.appRenderer);
  }

  update(_currentTime: number, deltaTime: number) {
    Time.setDeltaTime(deltaTime);

    this.uiControls.setFps(this.game.loop.actualFps);

    WorldManager.update();
    this.engine.update();
    this.appRenderer.update();
  }
}
