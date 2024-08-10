import { Scene, Geom } from "phaser";

import type { Transaction } from "~/common/types";
import type { AcceptsCommands, Command } from "~/common/Command";
import type { Placement } from "~/common/Placement";
import type { IVector2 } from "~/common/math";
import { formatNumber } from "~/common/utils";
import { NUM_FUTURE_BLOCKS } from "~/common/constants";

import { attachMotion, type Motion } from "~/movement/motion";
import { LinearMotion } from "~/movement/LinearMotion";

import { getAllIdentities, identityOf } from "~/identities/Identity";

import { createWalkPoints } from "./walks";

import { Person } from "./actors/Person";
import { Plane } from "./actors/Plane";
import { House } from "./actors/House";
import { StatsDisplay } from "./actors/StatsDisplay";

import { pixels } from "./sizing";
import { waitingZone, lineUpRoad } from './regions';

const SPACING = 16;

export class Renderer implements AcceptsCommands {
  private scene: Scene;

  private personMap: Map<string, Person>;
  private blockGroups: Map<string, number>;
  private planes: Plane[];
  private houses: House[];

  // Stats at the top
  private statsDisplay: StatsDisplay;

  /** Number of transactions in the mempool */
  private mempoolSize: number;

  /** Timestamp at which the last block was found */
  private lastBlockTime: number;

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

    this.initStats();
    this.initHouses();
    this.initPlanes();
    this.initWaitingZone();
  }

  // =========== Initialization ===========

  private initStats() {
    this.statsDisplay = new StatsDisplay(
      this.scene,
      pixels(2),
      pixels(0.25),
      pixels(7),
      pixels(1)
    );

    this.lastBlockTime = -1; // -1 shows there is no last block yet.
    this.setMempoolSize(0);
  }

  private initHouses() {
    this.houses = [];

    let left = 0;
    let top = 0;

    const addHouse = (textureName: string) => {
      let spacingX = 0.25;
      let spacingY = 1.5;
      let houseWidth = 1.625;
      
      let startX = 0.25;
      let startY = 8;
      
      let tileX = startX + (houseWidth + spacingX) * left;
      let tileY = startY + spacingY * top;

      this.houses.push(new House(
        this.scene,
        textureName, 
        pixels(tileX), pixels(tileY),
        pixels(houseWidth)
      ));

      left++;

      if (left === 2) {
        left = 0;
        top++;
      }
    };

    let houseTexture = "house-1";

    addHouse(houseTexture);

    for (const _iden of getAllIdentities()) {
      addHouse(houseTexture);
    }
  }

  private initWaitingZone() {
    this.waitingZone = Geom.Rectangle.Inflate(
      Geom.Rectangle.Clone(waitingZone.rect),
      -16,
      -16
    );
  }

  private initPlanes() {
    this.planes = [];

    let runway = lineUpRoad.rect;

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

  // =========== Methods ===========

  public setMempoolSize(size: number) {
    if (this.mempoolSize === size)
      //
      return;

    this.mempoolSize = size;

    // console.log("Mempool size updated: " + size);

    this.statsDisplay.mempoolSizeText.setText(
      "Pending Transactions: " + this.mempoolSize
    );
  }

  public setNewBlockTime() {
    this.lastBlockTime = new Date().getTime();
    // console.log("Block found: " + this.lastBlockTime);
  }

  // =========== Commands ===========

  private async cmdSpawn(tx: Transaction, placement: Placement | null) {
    let person = new Person(this.scene, tx);
    this.personMap.set(tx.id, person);

    let position: IVector2;
    if (placement === null) {
      position = this.getSpawnPosition(tx);
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

  private getSpawnPosition(tx: Transaction) {
    let identity = identityOf(tx);

    // 0th is default/fallback house, the remanining map to
    // to registered identities
    let index = identity === null ? 0 : identity.index + 1;

    return this.houses[index].getSpawnPosition();
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
    this.destroy();

    this.personMap = new Map();
    this.blockGroups = new Map();

    this.initStats();
    this.initPlanes();
    this.initHouses();
  }

  /* ======================================= */

  public update() {
    this.personMap.forEach(person => {
      person.update();
    });
    this.planes.forEach(plane => {
      plane.update();
    });

    // set last block time
    {
      let now = new Date().getTime();
      let lastBlockTime = this.lastBlockTime;

      let formatted =
        lastBlockTime === -1
          ? "N/A"
          : formatNumber((now - lastBlockTime) / 1000, { mantissa: 0 }) +
            " seconds ago";

      this.statsDisplay.blockTimeText.setText("Last Block Time: " + formatted);
    }
  }

  public destroy() {
    this.personMap.forEach(p => p.destroy());
    this.statsDisplay.destroy();
    this.houses.forEach(h => h.destroy());
    this.planes.forEach(b => b.destroy());
  }
}