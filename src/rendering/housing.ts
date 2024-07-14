import { Math } from "phaser";

import { Transaction } from "~/common/types";

export interface House {
  name: string;
  position: Math.Vector2;
}

// TODO: 0th house (fallback house) is the house of any
// transaction which does not have a valid house
export class HouseService {
  private readonly houses: readonly House[];

  constructor(houses: House[]) {
    this.houses = [...houses];
  }

  public getHouses(): readonly House[] {
    return this.houses;
  }

  public getHouseByIndex(index: number) {
    return this.houses[index];
  }

  public getTxHouse(tx: Transaction): House {
    return this.getHouseByIndex(0); // FIXME: Random
  }
}

/* ================================ */

export function getRegisteredHouses(): { name: string }[] {
  return [
    //
    { name: "House 1" },
    { name: "House 2" },
    { name: "House 3" }
  ];
}