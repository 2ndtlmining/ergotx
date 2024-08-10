import { Command } from "./Command";
import { arePlacementsEqual, Placement } from "./assemble/Placement";
import { Transaction } from "~/types/ergo";

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
