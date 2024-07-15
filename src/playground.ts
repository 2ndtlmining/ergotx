import "~/global.css";

import Phaser from "phaser";

import { SCENE_BG_COLOR } from "~/common/theme";
import { Person } from "./rendering/actors/Person";
import { attachMotion, Motion } from "./movement/motion";
import { LinearMotion } from "./movement/LinearMotion";
// import { Bus2 as Bus } from "./rendering/actors/Bus2";
import { LiveBus } from "./rendering/actors/LiveBus";

const SPACING = 16;
const GLOBAL_FRONTLINE = 48;
const NUM_BUSES = 4;
const LINE_CENTER = 600;

export class PlaygroundScene extends Phaser.Scene {
  buses: LiveBus[] = [];

  init() {
    console.log("PlaygroundScene::init()");
    (<any>window).p = this;
    (<any>window).driveOff = this.driveOff;

    // CREATE BUSES
    for (let i = 0; i < NUM_BUSES; ++i) {
      this.buses.push(new LiveBus(this, 200, 200));
    }

    // DRAW BUSES
    let frontline = GLOBAL_FRONTLINE;
    for (let i = 0; i < this.buses.length; ++i) {
      let bus = this.buses[i];
      bus.place({ x: LINE_CENTER, y: frontline });
      frontline += bus.getHeight() + SPACING;
    }
  }

  driveOff = () => {
    let motions: Motion[] = [];

    let firstBus = this.buses[0];

    let firstBusMotion = attachMotion(
      firstBus,
      new LinearMotion([
        {
          x: 800,
          y: GLOBAL_FRONTLINE
        }
      ])
    );

    motions.push(firstBusMotion);

    let newFrontline = GLOBAL_FRONTLINE;
    for (let i = 1; i < this.buses.length; ++i) {
      let bus = this.buses[i];

      let motion = attachMotion(
        bus,
        new LinearMotion([
          {
            x: LINE_CENTER,
            y: newFrontline
          }
        ])
      );

      motions.push(motion);

      newFrontline += bus.getHeight() + SPACING;
    }

    let motionPromises = Promise.all(motions.map(m => m.run()));

    return motionPromises.then(() => {
      this.buses.shift()?.destroy();
      let nextSpawnBus = new LiveBus(this, 200, 200);
      nextSpawnBus.place({ x: LINE_CENTER, y: newFrontline });
      this.buses.push(nextSpawnBus);
    });
  };

  update(_, deltaTime: number) {
    this.buses.forEach(bus => bus.update(deltaTime));
  }
}

let game = new Phaser.Game({
  type: Phaser.CANVAS,
  width: 1200,
  height: window.innerHeight,
  autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  powerPreference: "high-performance",
  scene: PlaygroundScene,
  backgroundColor: SCENE_BG_COLOR,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  }
});

(<any>window).game = game;

// */
