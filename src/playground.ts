import "~/global.css";

import Phaser from "phaser";

import { SCENE_BG_COLOR } from "~/common/theme";
import { Person } from "./rendering/actors/Person";
import { attachMotion } from "./movement/motion";
import { LinearMotion } from "./movement/LinearMotion";

export class PlaygroundScene extends Phaser.Scene {
  person: Person;

  init() {
    console.log("PlaygroundScene::init()");
    this.person = new Person(this, {} as any);

    this.person.place({ x: 40, y: 40 });

    attachMotion(
      this.person,
      new LinearMotion([
        {
          x: 600,
          y: 700
        }
      ])
    ).run();
  }

  update() {
    this.person.update();
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
