import { Renderer } from "~/rendering/Renderer";
import { WorldManager } from "~/rendering/WorldManager";
import { BaseScene } from "./BaseScene";
import { Time } from "~/common/Time";

import Controls from "./ui/Controls.svelte";

export class MainScene extends BaseScene {
  private visRenderer: Renderer;
  private uiControls: Controls;

  getTitle(): string {
    return "Main";
  }

  preload() {
    WorldManager.preloadTiles(this.load);
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
        }
      }
    });

    this.visRenderer = new Renderer(this);
    console.log("STARTED");
  }

  update(_currentTime: number, deltaTime: number) {
    Time.setDeltaTime(deltaTime);
    WorldManager.update();

    this.uiControls.setFps(this.game.loop.actualFps);

    this.visRenderer.update();
  }
}
