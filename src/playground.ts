import "~/global.css";

import Phaser from "phaser";

import { SCENE_BG_COLOR } from "~/common/theme";
import { Person } from "./rendering/actors/Person";
import { attachMotion, Motion } from "./movement/motion";
import { LinearMotion } from "./movement/LinearMotion";
import { Bus2 as Bus } from "./rendering/actors/Bus2";

const SPACING = 16;
const GLOBAL_FRONTLINE = 48;
const NUM_BUSES = 6;
const LINE_CENTER = 600;

export class PlaygroundScene extends Phaser.Scene {
  buses: Bus[] = [];

  init() {
    console.log("PlaygroundScene::init()");
    (<any>window).p = this;
    (<any>window).driveOff = this.driveOff;

    // CREATE BUSES
    for (let i = 0; i < NUM_BUSES; ++i) {
      this.buses.push(new Bus(this));
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
    // let motion = attachMotion(this.buses[1], new LinearMotion([{ x: 800, y: 50 }]));
    // motion.run();
    let motions: Motion[] = [];

    let firstBus = this.buses[0];

    let firstBusMotion = attachMotion(
      firstBus,
      new LinearMotion([
        {
          // x: LINE_CENTER,
          // y: -(firstBus.getHeight() + SPACING)
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
      // break;
    }

    Promise.all(motions.map(motion => motion.run())).then(() => {
      this.buses.shift()?.destroy();
    });
  };

  update() {
    this.buses.forEach(bus => bus.update());
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
