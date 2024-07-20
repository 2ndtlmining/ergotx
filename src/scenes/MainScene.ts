import { Renderer } from "~/rendering/Renderer";
import { WorldManager } from "~/rendering/WorldManager";
import { BaseScene } from "./BaseScene";
import { Time } from "~/common/Time";

import LeftControls from "./ui/LeftControls.svelte";

export class MainScene extends BaseScene {
  private visRenderer: Renderer;
  private leftControls: LeftControls;

  getTitle(): string {
    return "Main";
  }

  preload() {
    WorldManager.preloadTiles(this.load);
  }

  init() {
    this.leftControls = new LeftControls({
      target: document.getElementById("controls")!,
      props: {
        onShowGridlines: shouldShow => {
          if (WorldManager.IsInitialized)
            WorldManager.showGridLines(shouldShow);
        },
        onDebugRegions: shouldShow => {
          if (WorldManager.IsInitialized)
            WorldManager.showRegionsDebug(shouldShow);
        },
        worldToRegion: () => {
          return "World";
        }
      }
    });
  }

  create() {
    WorldManager.init(this);

    this.visRenderer = new Renderer(this);
    console.log("STARTED");
  }

  update(_currentTime: number, deltaTime: number) {
    Time.setDeltaTime(deltaTime);
    WorldManager.update();

    this.leftControls.setFps(this.game.loop.actualFps);

    this.visRenderer.update();
  }
}
