import { TransactedBlock, Transaction, VoidCallback } from "~/common/types";
import { EventEmitter } from "eventemitter3";
import { Update } from "./Update";

interface UpdateEvents {
  update: VoidCallback<Update>;
}

type UpdateEventEmitter = EventEmitter<UpdateEvents>;

export type PublicUpdateEventEmitter = Pick<
  UpdateEventEmitter,
  "on" | "once" | "off"
>;

export abstract class UpdateService {
  private queue: Update[] = [];
  private updateEmiiter: UpdateEventEmitter;

  constructor() {
    this.updateEmiiter = new EventEmitter();

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
