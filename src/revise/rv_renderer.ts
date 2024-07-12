import { Scene } from "phaser";
import { Transaction } from "~/common/app_types";
import { Engine, Move } from "./rv_engine";

import { Person } from "./Person";
import { HouseService, HouseList, House } from "./rv_house";

export class Renderer {
  private personMap: Map<string, Person>;
  private engine: Engine;
  private scene: Scene;

  private houseService: HouseService;

  constructor(scene: Scene) {
    this.personMap = new Map();
    this.engine = new Engine(this);
    this.scene = scene;

    this.houseService = new HouseService(buildHouseList());
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
    this.engine.startListening();
  }

  public update() {
    this.engine.update();
    this.personMap.forEach(person => {
      person.update();
    });
  }
}

/* ============================ */

function buildHouseList() {
  let list = new HouseList();
  list.addHouse("House A");
  list.addHouse("House B");
  list.addHouse("House C");
  return list;
}

