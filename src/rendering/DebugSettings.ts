import EventEmitter from "eventemitter3";
import { VoidCallback } from "~/common/types";

export const debugSettings = {
  debugBus: false,
  debugBusWalkIn: false
};

export type DebugSettings = typeof debugSettings;

const emitter = new EventEmitter<"settings">();

export function watchSettings(callback: VoidCallback<Readonly<DebugSettings>>) {
  let handler = () => callback(debugSettings);
  handler();

  emitter.on("settings", handler);

  return () => {
    emitter.off("settings", handler);
  };
}

export function updateSettings(callback: VoidCallback<DebugSettings>) {
  callback(debugSettings);
  emitter.emit("settings");
}
