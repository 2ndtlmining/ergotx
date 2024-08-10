import type { UpdateService } from "./UpdateService";
import type { Update } from "./Update";

import FileSaver from "file-saver";

export function watchUpdates(updateService: UpdateService) {
  let collected: Update[] = [];
  let stopped = true;

  let handlerUpdate = update => {
    collected.push(update);
  };

  function save() {
    const blob = new Blob([JSON.stringify(collected, null, 2)], {
      type: "application/json"
    });

    FileSaver.saveAs(blob, "replay.json");
  }

  function clear() {
    collected = [];
  }

  function start() {
    if (!stopped) return;

    updateService.getEmitter().on("update", handlerUpdate);
    stopped = false;
  }

  function stop() {
    if (stopped) return;

    updateService.getEmitter().off("update", handlerUpdate);
    stopped = true;
  }

  function get() {
    return collected;
  }

  return {
    save,
    clear,
    start,
    stop,
    get
  };
}
