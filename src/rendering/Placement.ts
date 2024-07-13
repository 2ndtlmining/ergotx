export type Placement =
  /* Tx is in waiting zone */
  | { type: "waiting" }
  /* Tx is in a block at the given index (from top) */
  | { type: "block"; index: number };

export function arePlacementsEqual(a: Placement, b: Placement) {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case "waiting":
      return true;
    case "block":
      return a.index === (<any>b).index;

    default:
      return false;
  }
}
