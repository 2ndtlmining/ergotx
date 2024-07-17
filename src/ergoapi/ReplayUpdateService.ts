import ky from "ky";

import { UpdateService } from "./UpdateService";
import { Update } from "./Update";
import EventEmitter from "eventemitter3";

export class ReplayUpdateService extends UpdateService {
  private taskId: number | null = null;
  private TASK_INTERVAL_MS = 200;

  private nextIndex: number = 0;
  private updates: Update[];

  private readyEmitter = new EventEmitter();
  private isReady = false;
  private pendingStart = false;
  private allEmitted = false;

  constructor(replayUrl: string) {
    super();
    ky.get(replayUrl)
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
        this.emitUpdate(update);
      } else {
        this.allEmitted = true;
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

  public getNextUpdate(): Update {
    let update = super.getNextUpdate();
    if (
      this.nextIndex === this.updates.length &&
      this.allEmitted &&
      !this.hasUpdatesInQueue()
    ) {
      console.log("Replay ended");
    }

    return update;
  }
}
