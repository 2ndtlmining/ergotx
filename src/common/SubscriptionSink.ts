import type EventEmitter from "eventemitter3";
import type { VoidCallback } from "./types";

export class SubscriptionSink {
  private handlers: VoidCallback[];

  public constructor() {
    this.handlers = [];
  }

  public event<
    EventTypes extends EventEmitter.ValidEventTypes,
    T extends EventEmitter.EventNames<EventTypes>
  >(
    emitter: EventEmitter<EventTypes, any>,
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>
  ) {
    emitter.on(event, fn);
    this.handlers.push(() => {
      emitter.off(event, fn);
    });
  }

  public manual(unsubscribe: VoidCallback) {
    this.handlers.push(unsubscribe);
  }

  public unsubscribeAll() {
    while (this.handlers.length) {
      this.handlers.shift()!();
    }
  }
}
