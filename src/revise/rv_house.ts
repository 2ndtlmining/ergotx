import { Math } from "phaser";
import { Transaction } from "~/common/app_types";

export interface House {
  index: number;
  name: string;
  position: Math.Vector2;
}

export class HouseList {
  private houses: House[] = [];

  constructor() {
    this.houses = [];
  }

  public addHouse(name: string) {
    let index = this.houses.length;
    this.houses.push({
      index,
      name,
      position: new Math.Vector2(0, 0)
    });
  }

  public getHouses(): House[] {
    return this.houses;
  }

  public getHouseByIndex(index: number) {
    return this.houses[index];
  }
}

// TODO: 0th house (fallback house) is the house of any
// transaction which does not have a valid house
export class HouseService {
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

  public getTxHouse(tx: Transaction): House {
    return this.getHouseByIndex(0); // FIXME: Random
  }
}