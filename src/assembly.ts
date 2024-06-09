import { PersonLocation, Transaction } from "./types";

export class Assembly {
  private _locationMap: Map<string, PersonLocation>;

  constructor(
    public readonly blocks: Array<Transaction[]>,
    public readonly waiting: Transaction[]
  ) {
    this._locationMap = new Map();
    for (const [tx, loc] of this.iter()) {
      this._locationMap.set(tx.id, loc);
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
}

export function AssembleTransactions(
  txs: Transaction[],
  maxBlocks: number
): Assembly {
  const TX_PER_BLOCK = 5;

  let blocks: Array<Transaction[]> = [];

  let i: number;
  for (i = 0; i < txs.length && blocks.length < maxBlocks; i += TX_PER_BLOCK) {
    let chunk = txs.slice(i, i + TX_PER_BLOCK);
    blocks.push(chunk);
  }

  let waiting: Transaction[] = [];
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

function CalculateHomeId(tx: Transaction) {
  return 0; // Okay for now
}


type MoveCommand = {
  tx: Transaction,
  from: PersonLocation,
  to: PersonLocation,
};

function* combineGenerators<G, R, T>(...generators: Generator<G, R, T>[]) {
  let last: R | null = null;
  for (let gen of generators) {
    last = yield* gen;
  }

  return last! as R;
}

function CalculateMoves(prev: Assembly, next: Assembly) {
  let commands: MoveCommand[] = [];

  for (const [tx] of combineGenerators(prev.iter(), next.iter())) {
    let oldLocation: PersonLocation;
    let newLocation: PersonLocation;

    if (prev.containsTx(tx.id)) {
      oldLocation = prev.getLocation(tx.id);
    } else {
      oldLocation = { type: "home", id: CalculateHomeId(tx) };
    }

    if (next.containsTx(tx.id)) {
      newLocation = next.getLocation(tx.id);
    } else {
      newLocation = { type: "destroy" };
    }

    if (!areLocationsEqual(oldLocation, newLocation)) {
      commands.push({ tx, from: oldLocation, to: newLocation });
    }
  }

  return commands;
}

/*

TxMoveCommand[] TxStateDelta(old, new) {
    let oldTx = TxLocations(old);
    let newTx = TxLocations(old);

    let commands = [];

    for tx in newTx + oldTx:
        let oldLocation;
        let targetLocation;

        if tx in oldTx:
                oldLocation = oldTx[tx]
            else
                oldLocation = TxHome(tx)

        if tx in newTx:
            targetLocation = newTx[tx]
        else
            targetLocation = DESTROY

        if oldLocation != targetLocation:
            commands.push({ tx: tx, from: oldLocation, to: targetLocation })
}

*/
