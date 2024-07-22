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

export class PlacementMap {
  private map: Map<string, Placement>;

  constructor() {
    this.map = new Map();
  }

  public get(txId: string) {
    // TODO: How to handle the case when the transaction
    // has not been placed anywhere ?
    return this.map.get(txId) ?? null;
  }

  public has(txId: string) {
    return this.map.has(txId);
  }

  public remove(txId: string) {
    this.map.delete(txId);
  }

  public placeWaiting(txId: string) {
    this.map.set(txId, { type: 'waiting' })
  }

  public placeBlock(txId: string, index: number) {
    this.map.set(txId, { type: 'block', index });
  }
}
