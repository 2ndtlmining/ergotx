import { Scene, Math, Geom } from "phaser";

import type { Transaction } from "~/common/types";
import type { AcceptsCommands, Command } from "~/common/Command";
import type { Placement } from "~/common/Placement";

import { attachMotion, type Motion } from "~/movement/motion";
import { LinearMotion } from "~/movement/LinearMotion";
import { HouseService, getRegisteredHouses } from "./housing";

import { Person } from "./actors/Person";
import { Plane } from "./actors/Plane";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";
import { WorldManager } from "./WorldManager";
import { createWalkPoints } from "./walks";
import { IVector2 } from "~/common/math";

const SPACING = 16;

export class Renderer implements AcceptsCommands {
  private scene: Scene;

  private personMap: Map<string, Person>;
  private blockGroups: Map<string, number>;
  private planes: Plane[];

  private houseService: HouseService;

  // Visuals related fields
  private waitingZone: Geom.Rectangle;
  private runwayLineX: number;
  private runwayWidth: number;
  private runwayTop: number;

  constructor(scene: Scene) {
    this.scene = scene;
    this.init();
  }

  private init() {
    this.personMap = new Map();
    this.blockGroups = new Map();

    this.initHouses();
    this.initWaitingZone();
    this.initPlanes();
  }

  // =========== Initialization ===========

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
  }

  private initWaitingZone() {
    this.waitingZone = Geom.Rectangle.Inflate(
      Geom.Rectangle.Clone(WorldManager.WaitingZone.rect),
      -16,
      -16
    );
  }

  private initPlanes() {
    this.planes = [];

    let runway = WorldManager.LineUpRoad.rect;

    this.runwayLineX = runway.centerX;
    this.runwayWidth = runway.width;
    this.runwayTop = runway.top;

    let frontline = this.runwayTop;
    for (let i = 0; i < NUM_FUTURE_BLOCKS; ++i) {
      let plane = new Plane(this.scene, this.runwayWidth);

      plane.place({ x: this.runwayLineX, y: frontline });
      frontline += plane.getHeight() + SPACING;

      this.planes.push(plane);
    }
  }

  // =========== Commands ===========

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
    this.destroyPerson(tx.id);
  }

  private async cmdWalk(
    tx: Transaction,
    source: Placement | null,
    dest: Placement
  ) {
    let person = this.getPerson(tx.id);
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

  private async cmdStepForward() {
    let frontlines = [-this.planes[0].getHeight()];

    let newFrontline = this.runwayTop;
    for (let i = 1; i < this.planes.length; ++i) {
      frontlines.push(newFrontline);
      newFrontline += this.planes[i].getHeight() + SPACING;
    }

    let motions: Motion[] = [];

    for (let i = 0; i < this.planes.length; ++i) {
      let planeMotion = attachMotion(
        this.planes[i],
        new LinearMotion([
          {
            x: this.runwayLineX,
            y: frontlines[i]
          }
        ])
      );

      motions.push(planeMotion);
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
        frontlines[currentBlock] - this.planes[currentBlock].getY();

      let person = this.getPerson(txId);
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
      this.destroyPerson(txId);
    }

    this.planes.shift()?.destroy();

    let nextSpawnedPlane = new Plane(this.scene, this.runwayWidth);
    nextSpawnedPlane.place({ x: this.runwayLineX, y: newFrontline });
    this.planes.push(nextSpawnedPlane);
  }

  public async executeCommands(commands: Command[]) {
    let cmdPromises = commands.map(cmd => {
      switch (cmd.type) {
        case "spawn":
          return this.cmdSpawn(cmd.tx, cmd.at ?? null);
        case "kill":
          return this.cmdKill(cmd.tx);
        case "walk":
          return this.cmdWalk(cmd.tx, cmd.source, cmd.dest);
        case "step_forward":
          return this.cmdStepForward();
      }
    });

    await Promise.all(cmdPromises);
  }

  // =========== Common ===========

  private allocatePlacement(
    txId: string,
    source: Placement | null,
    dest: Placement
  ): IVector2 {
    let targetPosition: Geom.Point;

    switch (dest.type) {
      case "waiting":
        targetPosition = this.waitingZone.getRandomPoint();

        if (source?.type === "block")
          // When moving out from a block to waiting zone, we
          // just do a quick horizontal movement.
          //
          // TODO: is this right ?
          targetPosition.y = this.getPerson(txId).getY();

        this.blockGroups.delete(txId);
        break;
      case "block":
        targetPosition = this.planes[dest.index].getWalkInTargetPoint();
        this.blockGroups.set(txId, dest.index);
        break;
    }

    return targetPosition;
  }

  private getPerson(txId: string) {
    return this.personMap.get(txId)!;
  }

  private destroyPerson(txId: string) {
    let person = this.getPerson(txId);
    person?.destroy();
    this.personMap.delete(txId);
    this.blockGroups.delete(txId);
  }

  public reset() {
    this.personMap.forEach(p => p.destroy());
    this.personMap = new Map();

    this.planes.forEach(b => b.destroy());

    this.blockGroups = new Map();

    this.initPlanes();
  }

  /* ======================================= */

  public update() {
    this.personMap.forEach(person => {
      person.update();
    });
    this.planes.forEach(plane => {
      plane.update();
    });
  }
}
