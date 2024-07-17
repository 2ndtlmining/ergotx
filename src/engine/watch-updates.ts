import type { UpdateService } from "~/ergoapi/UpdateService";
import type { Update } from "./Engine";

import FileSaver from 'file-saver';

export function watchUpdates(updateService: UpdateService) {
  let collected: Update[] = [];
  let stopped = true;

  let handlerTx = txs => {
    collected.push({
      type: "txs",
      transactions: txs
    });
  };

  let handlerBlock = block => {
    collected.push({
      type: "block",
      block
    });
  };

  function save() {
    // save
    const blob = new Blob([JSON.stringify(collected, null, 2)], {
      type: "application/json",
    });

    FileSaver.saveAs(blob, "replay.json");
  }

  function clear() {
    collected = [];
  }

  function start() {
    if (!stopped) return;

    updateService.on("txs", handlerTx).on("block", handlerBlock);
    stopped = false;
  }

  function stop() {
    if (stopped) return;

    updateService.off("txs", handlerTx).off("block", handlerBlock);
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
