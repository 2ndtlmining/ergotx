import { Transaction } from "~/common/types";
import { AgeMap } from "./AgeMap";
import { PlacementMap } from "./PlacementMap";

export class Assembly {
  constructor(
    public readonly transactions: Transaction[],
    public readonly ageMap: AgeMap,
    public readonly placementMap: PlacementMap
  ) {}

  public static empty(): Assembly {
    return new Assembly([], new AgeMap(), new PlacementMap());
  }
}
