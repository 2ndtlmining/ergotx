import { TransactedBlock, Transaction } from "~/types/ergo";
import { AppEmitter } from "~/utils/events";
import { Update } from "./Update";

interface UpdateEvents {
  update: Update;
}

type UpdateEventEmitter = AppEmitter<UpdateEvents>;

export type PublicUpdateEventEmitter = Pick<
  UpdateEventEmitter,
  "on" | "once" | "off"
>;

export abstract class UpdateService {
  private queue: Update[] = [];
  private updateEmiiter: UpdateEventEmitter;

  constructor() {
    this.updateEmiiter = new AppEmitter();

    // TODO: unsubscribe when no longer needed
    this.updateEmiiter.on("update", update => {
      this.queue.push(update);
    });
  }

  protected emitTxs(txs: Transaction[]) {
    this.updateEmiiter.emit("update", { type: "txs", transactions: txs });
  }

  protected emitBlock(block: TransactedBlock) {
    this.updateEmiiter.emit("update", { type: "block", block });
  }

  protected emitUpdate(update: Update) {
    this.updateEmiiter.emit("update", update);
  }

  public getEmitter(): PublicUpdateEventEmitter {
    return this.updateEmiiter;
  }

  public hasUpdatesInQueue() {
    return this.queue.length > 0;
  }

  /* Must be called when hasUpdatesInQueue() === true */
  public getNextUpdate(): Update {
    return this.queue.shift()!;
  }

  public abstract start(): void;
  public abstract stop(): void;
}
