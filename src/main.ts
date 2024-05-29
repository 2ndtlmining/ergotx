import "./global.css";

import Phaser, { Geom, Math, Scene, Input, Scale } from "phaser";

import { UpdateService } from "./ergo_api";
import { Transaction } from "./types";

class Person {
  private scene: Scene;

  private moveState: "moving" | "idle" = "idle";
  private start: Math.Vector2;
  private target: Math.Vector2;
  private moveSpeed = 160;

  private node: Phaser.GameObjects.GameObject;
  private nodeBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Scene, start: Math.Vector2, target: Math.Vector2) {
    this.scene = scene;
    this.start = start;
    this.target = target;

    this.node = scene.add.circle(start.x, start.y, 20, 0xedae26);
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

  destroy() {
    this.node.destroy();
  }
}

class MainScene extends Phaser.Scene {
  private persons: Person[];
  private waitingZone: Geom.Rectangle;

  private start: Math.Vector2;

  private updateService: UpdateService;
  private mempool: Transaction[];

  init() {
    this.mempool = [];
    this.persons = [];

    let canvasSize = {
      w: +this.game.config.width,
      h: +this.game.config.height
    };
    let waitingZoneWidth = 200;

    let waitingZone = new Geom.Rectangle(
      canvasSize.w - waitingZoneWidth,
      0,
      waitingZoneWidth,
      canvasSize.h
    );

    this.waitingZone = Geom.Rectangle.Inflate(waitingZone, -15, -16);
    this.start = new Math.Vector2(150, window.Math.round(canvasSize.h / 2));

    this.initUpdateService();
  }

  initUpdateService() {
    this.updateService = new UpdateService()
      .onUnconfirmedTransactions(transactions => {
        console.log("Found new txs: ", transactions.length);
        for (const candidTransaction of transactions) {
          let existing = this.mempool.find(
            tx => tx.id === candidTransaction.id
          );
          if (existing) continue;

          this.addTransaction(candidTransaction);
        }
      })
      .onNewBlock((block) => {
        console.log("Found block at height: ", block.height);

        for (const blockTx of block.transactions) {
          let existingIndex = this.mempool.findIndex(tx => {
            console.log(tx.id, blockTx.id);
            return tx.id === blockTx.id;
          })

          if (existingIndex === -1)
            continue;

          // let person = this.persons[]
          this.deleteTransaction(existingIndex);
        }

      });

    this.updateService.start();
  }

  create() {
    this.add.circle(this.start.x, this.start.y, 8, 0xffffff);

    this.add
      .rectangle(
        this.waitingZone.x,
        this.waitingZone.y,
        this.waitingZone.width,
        this.waitingZone.height,
        0x435153
      )
      .setOrigin(0, 0);

    // this.input.on(Input.Events.POINTER_DOWN, () => {
    //   this.addPerson();
    // });
  }

  addTransaction(tx: Transaction) {
    this.mempool.push(tx);
    this.addPerson();
  }

  deleteTransaction(index: number) {
    console.log("Deleting tx", index);
    let person = this.persons[index];
    person.destroy();
    this.mempool.splice(index, 1);
    this.persons.splice(index, 1);
  }

  addPerson() {
    let target = this.waitingZone.getRandomPoint();

    let person = new Person(
      this,
      this.start,
      new Math.Vector2(target.x, target.y)
    );
    this.persons.push(person);
  }

  update(_time: number, _delta: number): void {
    this.persons.forEach(p => p.update());
  }
}

let game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1200,
  height: window.innerHeight,
  autoCenter: Scale.Center.CENTER_BOTH,
  scene: MainScene,
  backgroundColor: 0x06303d,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  }
});
