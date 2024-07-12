import { Scene, Math, Geom } from "phaser";
import { Transaction } from "~/common/app_types";
import { Engine, Move } from "./rv_engine";

import { Person } from "./Person";
import { HouseService, House } from "./rv_house";
import { getRegisteredHouses } from "./misc";
import {
  HOUSE_COLOR,
  HOUSE_RADIUS,
  HOUSE_TEXT_COLOR,
  WAITING_ZONE_COLOR
} from "./theme";
import { Bus } from "./Bus";

export class Renderer {
  private scene: Scene;
  private personMap: Map<string, Person>;
  private engine: Engine;

  private houseService: HouseService;

  // Visuals related fields
  private canvasWidth: number;
  private canvasHeight: number;

  private waitingZone: Geom.Rectangle;
  private buses: Bus[];

  constructor(scene: Scene) {
    this.scene = scene;

    this.personMap = new Map();
    this.engine = new Engine(this);

    this.canvasWidth = +this.scene.game.config.width;
    this.canvasHeight = +this.scene.game.config.height;

    this.initHouses();
    this.initWaitingZone();
    this.initBuses();

    this.engine.startListening();
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
    this.houseService.getHouses().forEach(({ name, position }) => {
      this.scene.add.circle(position.x, position.y, HOUSE_RADIUS, HOUSE_COLOR);
      this.scene.add
        .text(position.x, position.y + 35, name, {
          fontSize: 20,
          color: HOUSE_TEXT_COLOR
        })
        .setOrigin(0.5, 0.5);
    });
  }

  private initWaitingZone() {
    let waitingZoneWidth = 300;

    let waitingZone = (this.waitingZone = Geom.Rectangle.Inflate(
      new Geom.Rectangle(
        this.canvasWidth - waitingZoneWidth - 300,
        0,
        waitingZoneWidth,
        this.canvasHeight
      ),
      -15,
      -16
    ));

    this.scene.add
      .rectangle(
        waitingZone.x,
        waitingZone.y,
        waitingZone.width,
        waitingZone.height,
        WAITING_ZONE_COLOR
      )
      .setOrigin(0, 0);
  }

  private initBuses() {
    let busZone = Geom.Rectangle.Clone(this.waitingZone).setPosition(
      this.waitingZone.x + this.waitingZone.width + 25,
      this.waitingZone.y
    );

    this.buses = [];
    let spacing = 10;
    let busHeight = 150;

    for (let i = 0; i < 5; ++i) {
      let region = new Geom.Rectangle(
        busZone.x,
        busZone.y + i * (busHeight + spacing),
        busZone.width,
        busHeight
      );

      this.buses.push(new Bus(this.scene, region, `Bus ${i}`));
    }
  }

  private spawnPerson(tx: Transaction) {
    // Spawn person at their house
    let person = new Person(this, tx);
    this.personMap.set(tx.id, person);

    let house = this.houseService.getTxHouse(tx);
    person.place(house.position);
  }

  public executeMove(moveHandle: number, move: Move) {
    if (move.isDying) {
      // schedule the person with transaction to die
      let person = this.getTxPerson(move.tx);
      person.moveToDeath(moveHandle);
      return;
    }

    if (move.isSpawning) {
      // spawn a person at the house
      this.spawnPerson(move.tx);
    }

    // schedule the person to move to move.placement
    let placement = move.placement!;

    let targetPosition: Geom.Point;
    switch (placement.type) {
      case "waiting":
        targetPosition = this.waitingZone.getRandomPoint();
        break;
      case "block":
        targetPosition = this.buses[placement.index].getRandomPoint();
        break;
    }

    let person = this.getTxPerson(move.tx);
    person.moveTo(moveHandle, targetPosition);
  }

  public onMoveComplete(moveHandle: number) {
    let move = this.engine.getActiveMove(moveHandle);

    if (move.isDying) {
      let person = this.getTxPerson(move.tx);
      person.destroy();
      this.personMap.delete(move.tx.id);
    }

    this.engine.onMoveComplete(moveHandle);
  }

  public update() {
    this.engine.update();
    this.personMap.forEach(person => {
      person.update();
    });
  }

  /* ============= */

  public getScene() {
    return this.scene;
  }

  private getTxPerson(tx: Transaction) {
    return this.personMap.get(tx.id)!;
  }
}
