import ky from "ky";

import { UpdateService } from "./UpdateService";
import { Update } from "~/engine/Engine";
import EventEmitter from "eventemitter3";

export class ReplayUpdateService extends UpdateService {
  private taskId: number | null = null;
  private TASK_INTERVAL_MS = 200;

  private nextIndex: number = 0;
  private updates: Update[];
  private readyEmitter = new EventEmitter();
  private isReady = false;
  private pendingStart = false;

  constructor() {
    super();
    ky.get("/replays/replay-01.json")
      .json()
      .then(contents => {
        this.updates = contents as Update[];
        this.nextIndex = 0;
        this.isReady = true;
        this.readyEmitter.emit("ready");
      });
  }

  public start() {
    if (this.pendingStart) return;

    this.stop();

    if (this.isReady) {
      this.startTimer();
    } else {
      this.pendingStart = true;
      this.readyEmitter.once("ready", () => {
        this.pendingStart = false;
        this.startTimer();
      });
    }
  }

  private startTimer() {
    this.taskId = setInterval(() => {
      if (this.nextIndex < this.updates.length) {
        let update = this.updates[this.nextIndex++];
        switch (update.type) {
          case "txs":
            this.emit("txs", update.transactions);
            break;
          case "block":
            this.emit("block", update.block);
            break;
        }
      } else {
        this.stop();
      }
    }, this.TASK_INTERVAL_MS);
  }

  public stop() {
    if (this.taskId) {
      clearInterval(this.taskId);
      this.taskId = null;
    }
  }
}
