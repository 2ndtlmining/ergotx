export class Region {
  constructor(
    public readonly startTileX: number,
    public readonly startTileY: number,
    public readonly numTilesX: number,
    public readonly numTilesY: number,
    public readonly debugName: string | undefined = "Region"
  ) {}
}
