import { Transaction } from "./rv_types";
import { Engine, Move, Placement } from "./rv_engine";

class Person {
  public update() {}
}

export class Renderer {
  private personMap: Map<string, Person>;
  private engine: Engine;

  constructor() {
    this.personMap = new Map();
    this.engine = new Engine(this);
  }

  private spawnPerson(tx: Transaction) {
    let person = new Person(/* At their house */);
    this.personMap.set(tx.id, person);
  }

  private getTxPerson(tx: Transaction) {
    return this.personMap.get(tx.id)!;
  }

  public executeMove(moveHandle: number, move: Move) {
    if (move.isDying) {
      // schedule the person with transaction to die
      return;
    }

    if (move.isSpawning) {
      this.spawnPerson(move.tx);
      // spawn a person at the house
    }

    let person = this.getTxPerson(move.tx);

    // get the person
    // schedule the person to move to move.placement
  }

  public update() {
    this.engine.update();
    this.personMap.forEach(person => {
      person.update();
    });
  }
}

/* ============================ */

/*

Assembly:
  txs
  placements
  age

Engine:
  currentAssembly
  targetAssembly
  spawningTxs
  dyingTxs
  movingTxs

Renderer
  TickStart
  TickApply
  ...
  TickApply
  TickEnd

--------

Tick
  Init
  Visualizing
  CleanUp

------

tick(newTxs):
  let txs = allMempoolNodes.map(intoTx)
  txs = mergeTxs(txs, newTxs)
    apply TxStateRepo

  newNodes = Assemble(txs)


*/
