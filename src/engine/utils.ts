import { Command } from "~/common/Command";
import { arePlacementsEqual, Placement } from "~/common/Placement";
import { Transaction } from "~/common/types";

export function walkIfNeeded(
  cmds: Command[],
  tx: Transaction,
  placementA: Placement | null,
  placementB: Placement
) {
  if (!placementA || !arePlacementsEqual(placementA, placementB)) {
    cmds.push({
      type: "walk",
      tx,
      prevPlacement: placementA,
      placement: placementB
    });
  }
}
