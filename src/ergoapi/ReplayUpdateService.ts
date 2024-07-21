import ky from "ky";

import { UpdateService } from "./UpdateService";
import { Update } from "./Update";

export class ReplayUpdateService extends UpdateService {
  private taskId: number | null = null;
  private TASK_INTERVAL_MS = 200;

  private nextIndex: number = 0;
  private updates: Update[];

  private readyPromise: Promise<void>;
  private allEmitted = false;

  constructor(replayUrl: string) {
    super();

    this.readyPromise = ky
      .get(replayUrl)
      .json()
      .then(contents => {
        this.updates = contents as Update[];
        this.nextIndex = 0;
      });
  }

  public emitNext(count: number = 1) {
    for (let i = 0; i < count; ++i) {
      if (this.nextIndex < this.updates.length) {
        let update = this.updates[this.nextIndex++];
        this.emitUpdate(update);
      } else {
        this.allEmitted = true;
        this.stop();
      }
    }
  }

  public async start() {
    await this.readyPromise;
    this.startTimer();
  }

  private startTimer() {
    this.taskId = setInterval(() => {
      this.emitNext();
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
