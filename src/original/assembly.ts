import { MempoolEntry, PersonLocation, Transaction } from "./types";

export class Assembly {
  private _locationMap: Map<string, PersonLocation>;

  constructor(
    public readonly blocks: Array<MempoolEntry[]>,
    public readonly waiting: MempoolEntry[]
  ) {
    this._locationMap = new Map();
    for (const [txEntry, loc] of this.iter()) {
      this._locationMap.set(txEntry.tx.id, loc);
    }
  }

  public containsTx(id: string) {
    return this._locationMap.has(id);
  }

  public getLocation(id: string) {
    return this._locationMap.get(id)!;
  }

  public *iter() {
    for (let blockIndex = 0; blockIndex < this.blocks.length; ++blockIndex) {
      let block = this.blocks[blockIndex];
      for (let i = 0; i < block.length; ++i) {
        let tx = block[i];
        yield [
          tx,
          { type: "bus", index: blockIndex } as PersonLocation
        ] as const;
      }
    }

    for (let i = 0; i < this.waiting.length; ++i) {
      let tx = this.waiting[i];
      yield [tx, { type: "waiting" } as PersonLocation] as const;
    }
  }

  public static empty() {
    return new Assembly([], []);
  }
}

export function AssembleTransactions(
  txs: MempoolEntry[],
  maxBlocks: number
): Assembly {
  const TX_PER_BLOCK = 5;

  let blocks: Array<MempoolEntry[]> = [];

  let i: number;
  for (i = 0; i < txs.length && blocks.length < maxBlocks; i += TX_PER_BLOCK) {
    let chunk = txs.slice(i, i + TX_PER_BLOCK);
    blocks.push(chunk);
  }

  let waiting: MempoolEntry[] = [];
  for (; i < txs.length; i++) {
    waiting.push(txs[i]);
  }

  return new Assembly(blocks, waiting);
}

function areLocationsEqual(a: PersonLocation, b: PersonLocation) {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case "waiting":
    case "destroy":
      return true;

    case "home":
      return a.id === (<any>b).id;
    case "bus":
      return a.index === (<any>b).index;

    default:
      return false;
  }
}

export function CalculateHomeId(tx: Transaction) {
  return 0; // Okay for now
}

function* combineGenerators<Y, R, T>(
  first: Generator<Y, R, T>,
  ...generators: Generator<Y, R, T>[]
) {
  let last = yield* first;
  for (let gen of generators) {
    last = yield* gen;
  }
  return last;
}

export type MoveCommand = {
  txEntry: MempoolEntry;
  from: PersonLocation;
  to: PersonLocation;
};

export function CalculateMoves(prev: Assembly, next: Assembly) {
  let commands: MoveCommand[] = [];

  for (const [txEntry] of combineGenerators(prev.iter(), next.iter())) {
    let oldLocation: PersonLocation;
    let newLocation: PersonLocation;

    if (prev.containsTx(txEntry.tx.id)) {
      oldLocation = prev.getLocation(txEntry.tx.id);
    } else {
      oldLocation = { type: "home", id: CalculateHomeId(txEntry.tx) };
    }

    if (next.containsTx(txEntry.tx.id)) {
      newLocation = next.getLocation(txEntry.tx.id);
    } else {
      newLocation = { type: "destroy" };
    }

    if (!areLocationsEqual(oldLocation, newLocation)) {
      commands.push({ txEntry, from: oldLocation, to: newLocation });
    }
  }

  return commands;
}
