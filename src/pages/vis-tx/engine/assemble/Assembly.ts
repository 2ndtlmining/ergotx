import { Transaction } from "~/types/ergo";
import { PlacementMap } from "./Placement";
import { AgeMap } from "./AgeMap";

export class Assembly {
  constructor(
    public readonly transactions: Transaction[],
    public readonly ageMap: AgeMap,
    public readonly placementMap: PlacementMap
  ) {}

  public static empty(): Assembly {
    return new Assembly([], new AgeMap(), new PlacementMap());
  }

  public contains(txId: string) {
    return this.ageMap.has(txId);
  }
}
