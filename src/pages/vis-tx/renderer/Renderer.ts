import { Scene, Geom, Loader } from "phaser";

import type { Transaction } from "~/types/ergo";
import type { AcceptsCommands, Command } from "../engine/Command";
import type { Placement } from "../engine/assemble/Placement";
import type { ThinVector } from "~/math/vector";
import { formatNumber } from "~/utils/number";
import { NUM_FUTURE_BLOCKS } from "~/constants/general";

import { attachMotion, SupportsMotion, type Motion } from "~/movement/motion";
import { LinearMotion } from "~/movement/LinearMotion";

import { getAllIdentities, identityOf } from "~/identities/Identity";

import { createWalkPoints } from "./walks";

import { Person } from "./actors/Person";
import { Plane } from "./actors/Plane";
import { House } from "./actors/House";
import { StatsDisplay } from "./actors/StatsDisplay";

import { pixels } from "./sizing";
import { waitingZone, lineUpRoad } from "./regions";
import { Actor } from "./actors/Actor";
import { isProduction } from "~/utils";

const SPACING = 16;

const personNames = [
  //
  "PersonA",
  "PersonB",
  "PersonC",
  "PersonD",
  "PersonE"
];
const faces = ["Front", "Side", "Back"];
const frames = ["01"];

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

  // Temp
  private isPaused = false;
  private get allActors(): (Actor & SupportsMotion)[] {
    return [...this.personMap.values(), ...this.planes];
  }

  constructor(scene: Scene) {
    this.scene = scene;
    this.init();

    if (!isProduction()) {
      scene.input.keyboard?.on("keyup-SPACE", () => {
        this.isPaused = !this.isPaused;
        this.allActors.forEach(actor => {
          actor.getMotionController().setPaused(this.isPaused);
        });
      });
    }
  }

  private init() {
    this.personMap = new Map();
    this.blockGroups = new Map();

    this.initStats();
    this.initHouses();
    this.initPlanes();
    this.initWaitingZone();
  }

  public static preload(load: Loader.LoaderPlugin) {
    load.image("house1", "/sv-assets/Tent/TentA.png");
    load.image("house2", "/sv-assets/Tent/TentB.png");
    load.image("house3", "/sv-assets/Tent/TentC.png");

    load.image("plane", "/sv-assets/Jet/Jet-01.png");

    for (const person of personNames) {
      for (const face of faces) {
        for (const frame of frames) {
          let tex = `${person}_${face}-${frame}`;
          load.image(tex, `/sv-assets/${person}/${tex}.png`);
        }
      }
    }
  }

  // =========== Initialization ===========

  private initStats() {
    this.statsDisplay = new StatsDisplay(this.scene);

    this.setMempoolSize(0);

    // Assume that a block has just been found.
    // This will always under-estimate, never over-estimate
    this.lastBlockTime = new Date().getTime();
  }

  private initHouses() {
    this.houses = [];

    let left = 0;
    let top = 0;

    let houseTextures = ["house1", "house2", "house3"];

    const nextTexture = () => {
      return houseTextures[(left + top) % houseTextures.length];
    };

    const addHouse = () => {
      let spacingX = 0.25;
      let spacingY = 2;
      let houseWidth = 1.625;

      let startX = 0.25;
      let startY = 8;

      let tileX = startX + (houseWidth + spacingX) * left;
      let tileY = startY + spacingY * top;

      this.houses.push(
        new House(
          this.scene,
          nextTexture(),
          pixels(tileX),
          pixels(tileY),
          pixels(houseWidth)
        )
      );

      left++;

      if (left === 2) {
        left = 0;
        top++;
      }
    };

    // addHouse();
    const numHouses = 4;

    // for (const _iden of getAllIdentities()) {
    for (let i = 0; i < numHouses; ++i) {
      addHouse();
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

    this.statsDisplay.setMempoolSize(size);
    // console.log("Mempool size updated: " + size);
  }

  public setNewBlockTime() {
    this.lastBlockTime = new Date().getTime();
    // console.log("Block found: " + this.lastBlockTime);
  }

  // =========== Commands ===========

  private async cmdSpawn(tx: Transaction, placement: Placement | null) {
    let person = this.createPerson(tx);

    let position: ThinVector;
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

  private getSpawnPosition(_tx: Transaction) {
    /* let identity = identityOf(tx);

    // 0th is default/fallback house, the remanining map to
    // to registered identities
    let index = identity === null ? 0 : identity.index + 1;
    */

    // For now we choose a random house
    let index = Math.floor(Math.random() * this.houses.length);

    return this.houses[index].getSpawnPosition();
  }

  private allocatePlacement(
    txId: string,
    source: Placement | null,
    dest: Placement
  ): ThinVector {
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

  private createPerson(tx: Transaction) {
    let name = personNames[Math.floor(Math.random() * personNames.length)];

    let person = new Person(this.scene, tx, name);
    this.personMap.set(tx.id, person);
    return person;
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
      this.statsDisplay.setBlockTime(now - this.lastBlockTime);
    }
  }

  public destroy() {
    this.personMap.forEach(p => p.destroy());
    this.statsDisplay.destroy();
    this.houses.forEach(h => h.destroy());
    this.planes.forEach(b => b.destroy());
  }
}
