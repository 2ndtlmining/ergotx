import { Scene, Math, Geom } from "phaser";

import type { Transaction } from "~/common/types";
import type { AcceptsCommands, Command } from "~/common/Command";
import type { Placement } from "~/common/Placement";

import { attachMotion, type Motion } from "~/movement/motion";
import { LinearMotion } from "~/movement/LinearMotion";
import { HouseService, getRegisteredHouses } from "./housing";

import { Person } from "./actors/Person";
import { LiveBus } from "./actors/LiveBus";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";
import { WorldManager } from "./WorldManager";
import { createWalkPoints } from "./walks";
import { IVector2 } from "~/common/math";

const SPACING = 16;

export class Renderer implements AcceptsCommands {
  private scene: Scene;

  private personMap: Map<string, Person>;
  private blockGroups: Map<string, number>;
  private buses: LiveBus[];

  private houseService: HouseService;

  // Visuals related fields
  private waitingZone: Geom.Rectangle;
  private busLineX: number;
  private busZoneWidth: number;
  private busZoneTop: number;

  constructor(scene: Scene) {
    this.scene = scene;
    this.personMap = new Map();
    this.blockGroups = new Map();

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
    this.waitingZone = Geom.Rectangle.Inflate(
      Geom.Rectangle.Clone(WorldManager.WaitingZone.rect),
      -16,
      -16
    );
  }

  private initBuses() {
    this.buses = [];

    let busZone = WorldManager.LineUpRoad.rect;

    this.busLineX = busZone.centerX;
    this.busZoneWidth = busZone.width;
    this.busZoneTop = busZone.top;

    let frontline = this.busZoneTop;
    for (let i = 0; i < NUM_FUTURE_BLOCKS; ++i) {
      let bus = new LiveBus(this.scene, this.busZoneWidth);

      bus.place({ x: this.busLineX, y: frontline });
      frontline += bus.getHeight() + SPACING;

      this.buses.push(bus);
    }
  }

  private async cmdSpawn(tx: Transaction, placement: Placement | null) {
    let person = new Person(this.scene, tx);
    this.personMap.set(tx.id, person);

    let position: IVector2;
    if (placement === null) {
      position = this.houseService.getTxHouse(tx).position;
    } else {
      position = this.allocatePlacement(tx.id, null, placement);
    }
    person.place(position);
  }

  private async cmdKill(tx: Transaction) {
    let person = this.getTxPerson(tx);
    person.destroy();
    this.personMap.delete(tx.id);
    this.blockGroups.delete(tx.id);
  }

  private allocatePlacement(
    txId: string,
    source: Placement | null,
    dest: Placement
  ): IVector2 {
    let targetPosition: Geom.Point;

    switch (dest.type) {
      case "waiting":
        targetPosition = this.waitingZone.getRandomPoint();

        if (source?.type === 'block')
          // When moving out from a block to waiting zone, we
          // just do a quick horizontal movement.
          //
          // TODO: is this right ?
          targetPosition.y = this.getTxIdPerson(txId).getY();

        this.blockGroups.delete(txId);
        break;
      case "block":
        targetPosition = this.buses[dest.index].getWalkInTargetPoint();
        this.blockGroups.set(txId, dest.index);
        break;
    }

    return targetPosition;
  }

  private async cmdWalk(
    tx: Transaction,
    source: Placement | null,
    dest: Placement
  ) {
    let person = this.getTxPerson(tx);
    let targetPosition = this.allocatePlacement(tx.id, source, dest);

    let walkPoints = createWalkPoints(
      {
        placement: source,
        position: { x: person.getX(), y: person.getY() }
      },
      { placement: dest, position: targetPosition }
    );

    let motion = new LinearMotion(walkPoints);
    return attachMotion(person, motion).run();
  }

  private async cmdDriveOff() {
    let frontlines = [-this.buses[0].getHeight()];

    let newFrontline = this.busZoneTop;
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

    const dyingTxIds: string[] = [];

    // update block groups and add animations
    for (const [txId, currentBlock] of this.blockGroups.entries()) {
      const newBlock = currentBlock - 1;

      if (newBlock === -1) {
        // this is going out of screen
        this.blockGroups.delete(txId);
        dyingTxIds.push(txId);
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
    for (const txId of dyingTxIds) {
      // TODO: make this into one function call
      this.getTxIdPerson(txId).destroy();
      this.personMap.delete(txId);
    }

    this.buses.shift()?.destroy();
    let nextSpawnBus = new LiveBus(this.scene, this.busZoneWidth);

    nextSpawnBus.place({ x: this.busLineX, y: newFrontline });

    this.buses.push(nextSpawnBus);
  }

  public executeCommands(commands: Command[]) {
    let cmdPromises = commands.map(cmd => {
      switch (cmd.type) {
        case "spawn":
          return this.cmdSpawn(cmd.tx, cmd.at ?? null);
        case "kill":
          return this.cmdKill(cmd.tx);
        case "walk":
          return this.cmdWalk(cmd.tx, cmd.source, cmd.dest);
        case "drive_off":
          return this.cmdDriveOff();
      }
    });

    return Promise.all(cmdPromises);
  }

  /* ======================================= */

  public update() {
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
