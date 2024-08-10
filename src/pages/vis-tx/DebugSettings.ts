import { VoidCallback } from "~/types/utility";
import { AppEmitter } from "~/utils/events";

export const debugSettings = {
  showGridlines: false,
  debugBlockActors: false,
  debugRegions: false
};

export type DebugSettings = typeof debugSettings;

const emitter = new AppEmitter<{ settings: void }>();

export function watchSettings(callback: VoidCallback<Readonly<DebugSettings>>) {
  let handler = () => callback(debugSettings);
  handler();

  emitter.on("settings", handler);

  return () => {
    emitter.off("settings", handler);
  };
}

export function updateSettings(updates: Partial<DebugSettings>) {
  Object.assign(debugSettings, updates);
  emitter.emit("settings");
}
