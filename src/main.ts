import "./global.css";

import Phaser, { Geom, Math, Scene, Input, Scale } from "phaser";

import { UpdateService } from "./ergo_api";
import { Transaction } from "./types";

class Person {
  private node: Phaser.GameObjects.GameObject;
  private nodeBody: Phaser.Physics.Arcade.Body;
  private waitingZone: Geom.Rectangle;
  private scene: Phaser.Scene;

  private moveSpeed = 300;
  private start: Math.Vector2;
  private target: Math.Vector2;

  private walkIntervalMs = 4000;
  private walkTime = 1000;
  private lastWalkAt = 0;
  private personState: "lining" | "idle" | "walking";

  constructor(
    scene: Scene,
    start: Math.Vector2,
    target: Math.Vector2,
    waitingZone: Geom.Rectangle
  ) {
    this.scene = scene;
    this.target = target;
    this.start = start;
    this.waitingZone = waitingZone;

    this.personState = "lining";
  }

  init() {
    this.personState = "lining";

    this.node = this.scene.add.circle(this.start.x, this.start.y, 20, 0xedae26);
    this.nodeBody = this.scene.physics.add.existing(this.node).body as any;

    this.scene.physics.moveTo(
      this.node,
      this.target.x,
      this.target.y,
      this.moveSpeed
    );
  }

  shouldStop(): boolean {
    let distance = Math.Distance.BetweenPoints(
      this.nodeBody.position,
      this.target
    );
    const tolerance = this.moveSpeed / 5;
    return distance <= tolerance;
  }

  update(time: number) {
    let isIdle = this.personState === "idle";
    if (!isIdle && this.shouldStop()) {
      this.nodeBody.stop();
      this.lastWalkAt = time;
      this.personState = "idle";
    }

    if (isIdle && time - this.lastWalkAt > this.walkIntervalMs) {
      this.lastWalkAt = time;
      this.personState = "walking";
      let targetPoint = this.waitingZone.getRandomPoint();

      this.target.set(targetPoint.x, targetPoint.y);
      this.scene.physics.moveTo(
        this.node,
        this.target.x,
        this.target.y,
        this.moveSpeed,
        this.walkTime
      );
    }
  }

  destroy() {
    this.node.destroy();
  }
}

type MempoolEntry = {
  age: number;
  tx: Transaction;
  person: Person;
};

class MainScene extends Phaser.Scene {
  private start: Math.Vector2;
  private waitingZone: Geom.Rectangle;

  private updateService: UpdateService;

  private mempool: MempoolEntry[];

  private MAX_TX_AGE = 4;

  init() {
    this.mempool = [];
    // this.persons = [];

    let canvasSize = {
      w: +this.game.config.width,
      h: +this.game.config.height
    };
    let waitingZoneWidth = 300;

    let waitingZone = new Geom.Rectangle(
      canvasSize.w - waitingZoneWidth,
      0,
      waitingZoneWidth,
      canvasSize.h
    );

    this.waitingZone = Geom.Rectangle.Inflate(waitingZone, -15, -16);
    this.start = new Math.Vector2(150, window.Math.round(canvasSize.h / 2));

    this.initUpdateService();
    // this.initClickToAddPerson();
  }

  // initClickToAddPerson() {
  //   this.input.on(Input.Events.POINTER_DOWN, () => {
  //   });
  // }

  initUpdateService() {
    this.updateService = new UpdateService()
      .onUnconfirmedTransactions(this.onTransactions)
      .onNewBlock(block => {
        console.log("Found block at height: ", block.height);

        for (const blockTx of block.transactions) {
          let existingIndex = this.mempool.findIndex(
            mtx => mtx.tx.id === blockTx.id
          );

          if (existingIndex === -1) continue;

          this.mempool[existingIndex].person.destroy();
          this.mempool.splice(existingIndex, 1);
        }
      });

    this.updateService.start();
  }

  onTransactions = (transactions: Transaction[]) => {
    console.log("Found new txs: ", transactions.length);

    for (let candidTx of transactions) {
      let index = this.mempool.findIndex(mtx => mtx.tx.id === candidTx.id);

      if (index === -1) {
        // We create this entry with age -1 so that later when all the transactions' ages
        // are incremented then this gets set to 0
        let person = this.createNewPerson();
        this.mempool.push({
          age: -1,
          person,
          tx: candidTx
        });
        person.init();
      } else {
        // This transaction is already in the mempool.
        // We have to reset its age. Similar to above, we
        // set its age to -1 to have it set to 0 later (below)
        this.mempool[index].age = -1;
      }
    }

    let newMempool: MempoolEntry[] = [];

    for (const entry of this.mempool) {
      ++entry.age;
      if (entry.age < this.MAX_TX_AGE) {
        newMempool.push(entry);
      } else {
        entry.person.destroy();
      }
    }

    this.mempool = newMempool;
  };

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
  }

  update(time: number, _delta: number): void {
    this.mempool.forEach(mtx => mtx.person.update(time));
  }

  createNewPerson() {
    let target = this.waitingZone.getRandomPoint();

    let person = new Person(
      this,
      this.start,
      new Math.Vector2(target.x, target.y),
      this.waitingZone
    );

    return person;
  }
}

let _game = new Phaser.Game({
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
