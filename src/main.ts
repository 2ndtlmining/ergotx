import "./global.css";

import Phaser, { Geom, Math, Scene, Input } from "phaser";

import { UpdateService } from "./ergo_api";
import { Transaction } from "./types";

const { Rectangle } = Geom;

class Person {
  private scene: Scene;

  private moveState: "moving" | "idle" = "idle";
  private start: Math.Vector2;
  private target: Math.Vector2;
  private moveSpeed = 100;

  private node: Phaser.GameObjects.GameObject;
  private nodeBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Scene, start: Math.Vector2, target: Math.Vector2) {
    this.scene = scene;
    this.start = start;
    this.target = target;

    // scene.add.circle(this.target.x, this.target.y, 20, 0xfff0ff);

    this.node = scene.add.circle(start.x, start.y, 20, 0xff00ff);
    this.nodeBody = scene.physics.add.existing(this.node).body as any;

    this.moveState = "moving";
    scene.physics.moveTo(this.node, target.x, target.y, this.moveSpeed);
  }

  shouldStop(): boolean {
    let distance = Math.Distance.BetweenPoints(
      this.nodeBody.position,
      this.target
    );
    const tolerance = this.moveSpeed / 3;
    return distance <= tolerance;
  }

  update() {
    if (this.shouldStop()) {
      this.nodeBody.stop();
      this.moveState = "idle";
    }
  }
}

class MainScene extends Phaser.Scene {
  private persons: Person[];

  init() {
    this.persons = [];
  }

  create() {
    let target = new Math.Vector2(400, 300);

    this.input.on(Input.Events.POINTER_DOWN, (pointer: Input.Pointer) => {
      let person = new Person(
        this,
        new Math.Vector2(pointer.x, pointer.y),
        target
      );
      this.persons.push(person);
    });
  }

  update(time: number, delta: number): void {
    // this.person.update();
    this.persons.forEach(p => p.update());
  }
}

let game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: MainScene,
  backgroundColor: 0x06303d,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true
    }
  }
});
