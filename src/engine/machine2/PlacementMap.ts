import { Transaction } from "~/common/types";
import { Placement } from "../Placement";

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
