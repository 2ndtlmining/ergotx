import { Scene, Math } from "phaser";
import { Transaction } from "~/common/app_types";
import { Engine, Move } from "./rv_engine";

import { Person } from "./Person";
import { HouseService, House } from "./rv_house";
import { getRegisteredHouses } from "./misc";
import { HOUSE_COLOR, HOUSE_RADIUS, HOUSE_TEXT_COLOR } from "./theme";

export class Renderer {
  private personMap: Map<string, Person>;
  private engine: Engine;
  private scene: Scene;

  private houseService: HouseService;

  constructor(scene: Scene) {
    this.personMap = new Map();
    this.engine = new Engine(this);
    this.scene = scene;

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

  private spawnPerson(tx: Transaction) {
    // Spawn person at their house
    let person = new Person(this, tx);
    this.personMap.set(tx.id, person);

    person.init();

    let house = this.houseService.getTxHouse(tx);
    person.place(house.position);
  }

  public getScene() {
    return this.scene;
  }

  private getTxPerson(tx: Transaction) {
    return this.personMap.get(tx.id)!;
  }

  // public onMoveComplete(moveHandle: number) {

  // }

  public executeMove(moveHandle: number, move: Move) {
    if (move.isDying) {
      // schedule the person with transaction to die
      return;
    }

    if (move.isSpawning) {
      // spawn a person at the house
      this.spawnPerson(move.tx);
    }

    // get the person
    let person = this.getTxPerson(move.tx);

    // schedule the person to move to move.placement
  }

  public init() {
    this.houseService.getHouses().forEach(({ name, position }) => {
      this.scene.add.circle(position.x, position.y, HOUSE_RADIUS, HOUSE_COLOR);
      this.scene.add
        .text(position.x, position.y + 35, name, {
          fontSize: 20,
          color: HOUSE_TEXT_COLOR
        })
        .setOrigin(0.5, 0.5);
    });

    this.engine.startListening();
  }

  public update() {
    this.engine.update();
    this.personMap.forEach(person => {
      person.update();
    });
  }
}
