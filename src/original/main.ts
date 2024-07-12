import "~/global.css";

import Phaser, { Geom, Math, Scene, Input, Scale, GameObjects } from "phaser";

import { UpdateService } from "~/common/ergo_api";
import { MempoolEntry, PersonLocation, Transaction } from "./types";
import {
  AssembleTransactions,
  Assembly,
  CalculateHomeId,
  CalculateMoves
} from "./assembly";

export class Person {
  private node: Phaser.GameObjects.GameObject;
  private nodeBody: Phaser.Physics.Arcade.Body;
  private waitingZone: Geom.Rectangle;
  private scene: Phaser.Scene;

  private moveSpeed = 300;
  private start: Math.Vector2;
  private target: Math.Vector2;

  // private walkIntervalMs = 4000;
  private walkTime = 1000;
  // private lastWalkAt = 0;
  private personState: "idle" | "walking";

  /* ---------------------  */

  private location: PersonLocation;

  constructor(
    tx: Transaction,
    scene: Scene,
    // start: Math.Vector2,
    // target: Math.Vector2,
    waitingZone: Geom.Rectangle
  ) {
    this.scene = scene;
    this.waitingZone = waitingZone;

    let homeId = CalculateHomeId(tx);

    this.location = { type: "home", id: homeId };

    this.start = this.homePosition(homeId);
    this.target = new Math.Vector2();

  }

  init() {
    this.personState = "idle";

    this.node = this.scene.add.circle(this.start.x, this.start.y, 20, 0xedae26);
    this.nodeBody = this.scene.physics.add.existing(this.node).body as any;

    this.nodeBody.position.setFromObject(this.start);

    // this.scene.physics.moveTo(
    //   this.node,
    //   this.target.x,
    //   this.target.y,
    //   this.moveSpeed
    // );
  }

  shouldStop(): boolean {
    let a = this.start.clone().subtract(this.target);
    let b = new Math.Vector2()
      .setFromObject(this.nodeBody.position)
      .subtract(this.target);

    return a.dot(b) <= 0;
  }

  private getScene() {
    return this.scene as MainScene;
  }

  homePosition(id: number) {
    return this.getScene().houses[id].clone();
  }

  setNewLocation(loc: PersonLocation) {
    this.location = loc;
    let position: Math.Vector2;

    switch (loc.type) {
      case "home":
        position = this.homePosition(loc.id);
        break;

      case "waiting":
        position = new Math.Vector2().setFromObject(
          this.waitingZone.getRandomPoint()
        );
        break;

      case "bus":
        position = new Math.Vector2().setFromObject(
          this.getScene().buses[loc.index].getLandingPoint()
        );
        break;

      case "destroy":
        position = new Math.Vector2(1000, -1000);
        break;
    }

    this.personState = "walking";

    this.start.setFromObject(this.nodeBody.position);
    this.target = position;

    this.scene.physics.moveTo(
      this.node,
      this.target.x,
      this.target.y,
      this.moveSpeed,
      this.walkTime
    );
  }

  update(time: number) {
    let isIdle = this.personState === "idle";
    if (!isIdle && this.shouldStop()) {
      this.nodeBody.stop();
      if (this.location.type === 'destroy')
        this.destroy();
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


class Bus {
  scene: Phaser.Scene;
  public region: Geom.Rectangle;
  private stayRegion: Geom.Rectangle;
  public index: number;

  constructor(scene: Scene, index: number, region: Geom.Rectangle) {
    this.scene = scene;
    this.index = index;
    this.region = region;

    this.stayRegion = Geom.Rectangle.Inflate(Geom.Rectangle.Clone(region), -100, -100);
  }

  init() {
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

  public getLandingPoint() {
    return this.stayRegion.getRandomPoint();
  }
}

class MainScene extends Phaser.Scene {
  public houses: Math.Vector2[];
  private waitingZone: Geom.Rectangle;
  private busZone: Geom.Rectangle;
  public buses: Bus[];

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

        let newMempool = [...this.mempool];

        for (const blockTx of block.transactions) {
          let existingIndex = newMempool.findIndex(
            mtx => mtx.tx.id === blockTx.id
          );

          if (existingIndex === -1) continue;

          // newMempool.splice(existingIndex, 1);
          newMempool[existingIndex] = false as any;
          // entry.person.setNewLocation({ type: 'destroy' });

          // this.assembly = AssembleTransactions(this.mempool, 5);
        }

        newMempool = newMempool.filter(Boolean);

        this.mempoolUpdated(newMempool);
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


  private mempoolUpdated(newMempool: MempoolEntry[]) {
    let newAsembly = AssembleTransactions(
      newMempool,
      this.buses.length
    );

    let commands = CalculateMoves(this.assembly, newAsembly);
    // console.log(commands);

    this.assembly = newAsembly;
    this.mempool = newMempool;

    for (const cmd of commands) {
      console.log("CMD", cmd.from, cmd.to);
      // let node = this.mempool.find(entry => entry.tx.id === cmd.tx.id)!;
      cmd.txEntry.person.setNewLocation(cmd.to);
    }
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
        // delete
        changed = true;
        // entry.person.destroy();
      }
    }

    if (changed) {
      this.mempoolUpdated(newMempool);
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
    let person = this.createNewPerson(tx);
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

  createNewPerson(tx: Transaction) {
    let person = new Person(
      tx,
      this,
      // start,
      // new Math.Vector2(target.x, target.y),
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
