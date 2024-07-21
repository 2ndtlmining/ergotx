import { Scene, Math, Geom } from "phaser";

import { Transaction } from "~/common/types";
import {
  HOUSE_COLOR,
  HOUSE_RADIUS,
  HOUSE_TEXT_COLOR,
  WAITING_ZONE_COLOR
} from "~/common/theme";

import { Engine } from "~/engine/Engine";
import type { AcceptsCommands, Command } from "~/engine/Command";
import type { Placement } from "~/engine/Placement";

import { attachMotion, Motion } from "~/movement/motion";
import { LinearMotion } from "~/movement/LinearMotion";
import { HouseService, getRegisteredHouses } from "./housing";

import { Person } from "./actors/Person";
// import { Bus } from "./actors/Bus";
import { LiveBus } from "./actors/LiveBus";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";
import { watchUpdates } from "~/engine/watch-updates";
import { WorldManager } from "./WorldManager";

const SPACING = 16;
const GLOBAL_FRONTLINE = 48;

export class Renderer implements AcceptsCommands {
  private scene: Scene;

  private personMap: Map<string, Person>;
  private blockGroups: Map<string, number>;

  private engine: Engine;
  private houseService: HouseService;

  // Visuals related fields
  private waitingZone: Geom.Rectangle;
  private busLineX: number;
  private newBusWidth: number;
  private newBusHeight: number;

  private buses: LiveBus[];

  constructor(scene: Scene) {
    this.scene = scene;
    this.personMap = new Map();
    this.blockGroups = new Map();

    this.engine = new Engine(this);

    (<any>window).r = this;

    this.initHouses();
    this.initWaitingZone();
    this.initBuses();
  }

  private initHouses() {
    // Init house service
    this.houseService = new HouseService([
      {
        name: "Default House",
        position: new Math.Vector2(150, 150)
      },
      ...getRegisteredHouses().map((houseData, index) => ({
        name: houseData.name,
        position: new Math.Vector2(150, 150 + 200 * (index + 1))
      }))
    ]);

    // Draw houses
    // this.houseService.getHouses().forEach(({ name, position }) => {
    //   this.scene.add.circle(position.x, position.y, HOUSE_RADIUS, HOUSE_COLOR);
    //   this.scene.add
    //     .text(position.x, position.y + 35, name, {
    //       fontSize: 20,
    //       color: HOUSE_TEXT_COLOR
    //     })
    //     .setOrigin(0.5, 0.5);
    // });
  }

  private initWaitingZone() {
    let waitingZoneWidth = 300;

    let waitingZone = (this.waitingZone = Geom.Rectangle.Inflate(
      new Geom.Rectangle(
        WorldManager.CanvasWidth - waitingZoneWidth - 300,
        0,
        waitingZoneWidth,
        WorldManager.CanvasHeight
      ),
      -15,
      -16
    ));

    // this.scene.add
    //   .rectangle(
    //     waitingZone.x,
    //     waitingZone.y,
    //     waitingZone.width,
    //     waitingZone.height,
    //     WAITING_ZONE_COLOR
    //   )
    //   .setOrigin(0, 0);
  }

  private initBuses() {
    this.buses = [];

    // TODO: Don't need the whole rectangle
    let busZone = Geom.Rectangle.Clone(this.waitingZone).setPosition(
      this.waitingZone.x + this.waitingZone.width + 25,
      this.waitingZone.y
    );

    this.busLineX = busZone.centerX;

    this.newBusWidth = busZone.width;
    this.newBusHeight = 150;

    let frontline = GLOBAL_FRONTLINE;
    for (let i = 0; i < NUM_FUTURE_BLOCKS; ++i) {
      let bus = new LiveBus(this.scene, this.newBusWidth, this.newBusHeight);

      bus.place({ x: this.busLineX, y: frontline });
      frontline += bus.getHeight() + SPACING;

      this.buses.push(bus);
    }
  }

  private async cmdSpawn(tx: Transaction) {
    let person = new Person(this.scene, tx);
    this.personMap.set(tx.id, person);

    let house = this.houseService.getTxHouse(tx);
    person.place(house.position);
  }

  private async cmdKill(tx: Transaction) {
    let person = this.getTxPerson(tx);
    person.destroy();
    this.personMap.delete(tx.id);
    this.blockGroups.delete(tx.id);
  }

  private async cmdWalk(tx: Transaction, placement: Placement) {
    let person = this.getTxPerson(tx);

    let targetPosition: Geom.Point;

    switch (placement.type) {
      case "waiting":
        targetPosition = this.waitingZone.getRandomPoint();
        this.blockGroups.delete(tx.id);
        break;
      case "block":
        targetPosition = this.buses[placement.index].getWalkInTargetPoint();
        this.blockGroups.set(tx.id, placement.index);
        break;
    }

    let motion = new LinearMotion([targetPosition]);
    return attachMotion(person, motion).run();
  }

  private async cmdDriveOff() {
    let frontlines = [-this.buses[0].getHeight()];

    let newFrontline = GLOBAL_FRONTLINE;
    for (let i = 1; i < this.buses.length; ++i) {
      frontlines.push(newFrontline);
      newFrontline += this.buses[i].getHeight() + SPACING;
    }

    let motions: Motion[] = [];

    for (let i = 0; i < this.buses.length; ++i) {
      let busMotion = attachMotion(
        this.buses[i],
        new LinearMotion([
          {
            x: this.busLineX,
            y: frontlines[i]
          }
        ])
      );

      motions.push(busMotion);
    }

    // update block groups and add animations
    for (const [txId, currentBlock] of this.blockGroups.entries()) {
      const newBlock = currentBlock - 1;

      if (newBlock === -1) {
        // this is going out of screen
        this.blockGroups.delete(txId);
      } else {
        // this is going to the block above
        this.blockGroups.set(txId, newBlock);
      }

      let displacement =
        frontlines[currentBlock] - this.buses[currentBlock].getY();

      let person = this.getTxIdPerson(txId);
      let personMotion = attachMotion(
        person,
        new LinearMotion([
          {
            x: person.getX(),
            y: person.getY() + displacement
          }
        ])
      );

      motions.push(personMotion);
    }

    await Promise.all(motions.map(m => m.run()));

    this.buses.shift()?.destroy();
    let nextSpawnBus = new LiveBus(
      this.scene,
      this.newBusWidth,
      this.newBusHeight
    );

    // this.scene.children.sendToBack(nextSpawnBus.getGameObject());
    nextSpawnBus.place({ x: this.busLineX, y: newFrontline });

    this.buses.push(nextSpawnBus);
  }

  public executeCommands(commands: Command[]) {
    // console.log("CMDS: ", commands);
    let cmdPromises = commands.map(cmd => {
      switch (cmd.type) {
        case "spawn":
          return this.cmdSpawn(cmd.tx);
        case "kill":
          return this.cmdKill(cmd.tx);
        case "walk":
          return this.cmdWalk(cmd.tx, cmd.placement);
        case "drive_off":
          return this.cmdDriveOff();
      }
    });

    return Promise.all(cmdPromises);
  }

  /* ======================================= */

  public update() {
    this.engine.update();
    this.personMap.forEach(person => {
      person.update();
    });
    this.buses.forEach(bus => {
      bus.update();
    });
  }

  /* ======================================= */

  private getTxPerson(tx: Transaction) {
    return this.personMap.get(tx.id)!;
  }

  // TODO: make this and the one above a single function
  private getTxIdPerson(txId: string) {
    return this.personMap.get(txId)!;
  }
}
