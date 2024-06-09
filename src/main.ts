import "./global.css";

import Phaser, { Geom, Math, Scene, Input, Scale, GameObjects } from "phaser";

import { UpdateService } from "./ergo_api";
import { PersonLocation, Transaction } from "./types";
import { AssembleTransactions, Assembly, CalculateMoves } from "./assembly";

class Person {
  private node: Phaser.GameObjects.GameObject;
  private nodeBody: Phaser.Physics.Arcade.Body;
  // private waitingZone: Geom.Rectangle;
  private scene: Phaser.Scene;

  private moveSpeed = 300;
  private start: Math.Vector2;
  private target: Math.Vector2;

  // private walkIntervalMs = 4000;
  // private walkTime = 1000;
  // private lastWalkAt = 0;
  private personState: "lining" | "idle" | "walking";

  /* ---------------------  */

  private location: PersonLocation;

  constructor(
    scene: Scene,
    start: Math.Vector2,
    target: Math.Vector2,
    waitingZone: Geom.Rectangle
  ) {
    this.scene = scene;
    this.target = target;
    this.start = start.clone();
    // this.waitingZone = waitingZone;

    this.personState = "lining";
    this.location = { type: "waiting" };
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
    let a = this.start.clone().subtract(this.target);
    let b = new Math.Vector2()
      .setFromObject(this.nodeBody.position)
      .subtract(this.target);

    return a.dot(b) <= 0;
  }

  update(time: number) {
    let isIdle = this.personState === "idle";
    if (!isIdle && this.shouldStop()) {
      this.nodeBody.stop();
      // this.lastWalkAt = time;
      this.personState = "idle";
    }

    // if (isIdle && time - this.lastWalkAt > this.walkIntervalMs) {
    //   this.lastWalkAt = time;
    //   this.personState = "walking";
    //   let targetPoint = this.waitingZone.getRandomPoint();

    //   this.start.setFromObject(this.nodeBody.position);
    //   this.target.set(targetPoint.x, targetPoint.y);
    //   this.scene.physics.moveTo(
    //     this.node,
    //     this.target.x,
    //     this.target.y,
    //     this.moveSpeed,
    //     this.walkTime
    //   );
    // }
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

class Bus {
  scene: Phaser.Scene;
  region: Geom.Rectangle;
  index: number;

  constructor(scene: Scene, index: number, region: Geom.Rectangle) {
    this.scene = scene;
    this.index = index;
    this.region = region;
  }

  init() {
    // console.log("addedToScene " + this.index);
    this.scene.add
      .rectangle(
        this.region.x,
        this.region.y,
        this.region.width,
        this.region.height,
        0x553c69
      )
      .setOrigin(0, 0);

    this.scene.add
      .text(this.region.x + 4, this.region.y + 4, "Bus " + this.index)
      .setOrigin(0, 0);
  }
}

class MainScene extends Phaser.Scene {
  // private start: Math.Vector2;
  private houses: Math.Vector2[];
  private waitingZone: Geom.Rectangle;
  private busZone: Geom.Rectangle;
  private buses: Bus[];

  private updateService: UpdateService;

  private mempool: MempoolEntry[];
  private assembly: Assembly;

  private MAX_TX_AGE = 4;

  init() {
    this.mempool = [];
    this.assembly = Assembly.empty();

    let canvasSize = {
      w: +this.game.config.width,
      h: +this.game.config.height
    };

    /* ============================================== */

    this.houses = this.createHouses(canvasSize);

    /* ============================================== */

    let waitingZoneWidth = 300;

    let waitingZone = new Geom.Rectangle(
      canvasSize.w - waitingZoneWidth - 300,
      0,
      waitingZoneWidth,
      canvasSize.h
    );
    this.waitingZone = Geom.Rectangle.Inflate(waitingZone, -15, -16);

    /* ============================================== */

    this.busZone = Geom.Rectangle.Clone(this.waitingZone).setPosition(
      this.waitingZone.x + this.waitingZone.width + 25,
      this.waitingZone.y
    );

    /* ============================================== */

    // this.buses = [
    // new Bus(this, 0),
    // new Bus(this, 1),
    // new Bus(this, 2),
    // ];
    this.buses = [];
    let spacing = 10;
    let busHeight = 150;

    for (let i = 0; i < 5; ++i) {
      let region = new Geom.Rectangle(
        this.busZone.x,
        this.busZone.y + i * (busHeight + spacing),
        this.busZone.width,
        busHeight
      );

      this.buses.push(new Bus(this, i, region));
    }

    /* ============================================== */

    this.initUpdateService();
    // this.initClickToAddPerson();
  }

  initClickToAddPerson() {
    this.input.on(Input.Events.POINTER_DOWN, () => {
      this.addTx({ id: "d", inputs: [], outputs: [] }, 0);
    });
  }

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

  private createHouses({}: { w: number; h: number }): Math.Vector2[] {
    // prettier-ignore
    return [
      new Math.Vector2(150, 150), new Math.Vector2(350, 150),
      new Math.Vector2(150, 350), new Math.Vector2(350, 350),
      new Math.Vector2(150, 550), new Math.Vector2(350, 550),
    ];
  }

  private onTransactions = (transactions: Transaction[]) => {
    console.log("Found new txs: ", transactions.length);

    let changed = false;

    for (let candidTx of transactions) {
      let index = this.mempool.findIndex(mtx => mtx.tx.id === candidTx.id);

      if (index === -1) {
        // We create this entry with age -1 so that later when all the transactions' ages
        // are incremented then this gets set to 0
        this.addTx(candidTx, -1);
        changed = true;
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
        changed = true;
        entry.person.destroy();
      }
    }

    if (changed) {
      let newAsembly = AssembleTransactions(
        newMempool.map(entry => entry.tx),
        this.buses.length
      );

      let commands = CalculateMoves(this.assembly, newAsembly);
      console.log(commands);

      this.assembly = newAsembly;
      this.mempool = newMempool;

      console.log(newAsembly);
    }
  };

  create() {
    this.add
      .rectangle(
        this.waitingZone.x,
        this.waitingZone.y,
        this.waitingZone.width,
        this.waitingZone.height,
        0x435153
      )
      .setOrigin(0, 0);

    // this.add
    //   .rectangle(
    //     this.busZone.x,
    //     this.busZone.y,
    //     this.busZone.width,
    //     this.busZone.height,
    //     0x553c69
    //   )
    //   .setOrigin(0, 0);

    // Add houses
    this.houses.forEach((house, index) => {
      this.add.circle(house.x, house.y, 6, 0xffffff);
      this.add
        .text(house.x, house.y + 35, `House ${index + 1}`, {
          fontSize: 20,
          color: "#69f542"
        })
        .setOrigin(0.5, 0.5);
    });

    // Add buses
    this.buses.forEach(bus => bus.init());
  }

  addTx(tx: Transaction, age: number) {
    let person = this.createNewPerson();
    this.mempool.push({
      age,
      person,
      tx
    });
    person.init();
  }

  update(time: number, _delta: number): void {
    this.mempool.forEach(mtx => mtx.person.update(time));
  }

  createNewPerson() {
    let house = randomElem(this.houses);

    let start = house.clone();
    let target = this.waitingZone.getRandomPoint();

    let person = new Person(
      this,
      start,
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

function randomElem<T>(array: T[]): T {
  return array[window.Math.floor(window.Math.random() * array.length)];
}
