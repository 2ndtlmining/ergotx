import { Command } from "~/common/Command";
import { arePlacementsEqual, Placement } from "~/common/Placement";
import { Transaction } from "~/common/types";

export function walkIfNeeded(
  cmds: Command[],
  tx: Transaction,
  source: Placement | null,
  dest: Placement
) {
  if (!source || !arePlacementsEqual(source, dest)) {
    cmds.push({
      type: "walk",
      tx,
      source,
      dest
    });
  }
}
