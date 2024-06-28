import Phaser, { Scene } from "phaser";
import { Transaction } from "./rv_types";

// import { Placement } from "./rv_vistypes";

export type Placement =
  | { type: "house"; index: number }
  | { type: "waiting" }
  | { type: "bus"; index: number }
  | { type: "destruction" };

export class WrapSprite {
  protected scene: Scene;
  protected gameObject: Phaser.GameObjects.GameObject;
  protected physicsBody: Phaser.Physics.Arcade.Body;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  protected buildSprite(gameObject: Phaser.GameObjects.GameObject) {
    this.gameObject = gameObject;
    this.physicsBody = this.scene.physics.add.existing(gameObject).body as any;
  }

  public destroy() {
    this.gameObject.destroy();
  }
}

export interface PersonIdentity {
  tx: Transaction;
  house: House;
  placement: Placement;
}

export class Person extends WrapSprite {
  private static CIRCLE_RADIUS = 20;

  private identity: PersonIdentity;

  public static spawnAtHouse(
    scene: Scene,
    tx: Transaction,
    houseService: HouseService
  ) {
    let house = houseService.getHouseForTransaction(tx);

    // return new Person(scene, tx, house, {
    //   type: "house",
    //   index: house.index
    // });
  }

  constructor(
    scene: Scene,
    identity: PersonIdentity,
    // tx: Transaction,
    // house: House,
    // placement: Placement,
  ) {
    super(scene);
    this.identity = identity;

    // this.tx = tx;
    // this.placement = placement;
  }

  public init() {
    this.buildSprite(
      this.scene.add.circle(-100, -100, Person.CIRCLE_RADIUS, 0xedae26)
    );
  }
}

/* ========================== */

interface House {
  index: number;
  name: string;
}

class HouseList {
  private houses: House[] = [];

  constructor() {
    this.houses = [];
  }

  public addHouse(name: string) {
    let index = this.houses.length;
    this.houses.push({
      index,
      name
    });
  }

  public getHouses() {
    return this.houses;
  }

  public getHouseByIndex(index: number) {
    return this.houses[index];
  }
}

class HouseService {
  private list: HouseList;

  constructor(list: HouseList) {
    this.list = list;
  }

  public getHouses() {
    return this.list.getHouses();
  }

  public getHouseByIndex(index: number) {
    return this.list.getHouseByIndex(index);
  }

  public getHouseForTransaction(tx: Transaction): House {
    return this.getHouseByIndex(0); // FIXME: Random
  }
}

/* ========================== */
