import type { AllowedEvents, AppEmitter, EventNames, EventListener } from "./events";
import type { VoidCallback } from "./types";

export class SubscriptionSink {
  private handlers: VoidCallback[];

  public constructor() {
    this.handlers = [];
  }

  public static oneshot<
    T extends AllowedEvents,
    E extends EventNames<T>
  >(
    emitter: AppEmitter<T>,
    event: E,
    fn: EventListener<T, E>
  ) {
    emitter.on(event, fn);
    return () => {
      emitter.off(event, fn);
    };
  }

  public manual(unsubscribe: VoidCallback) {
    this.handlers.push(unsubscribe);
  }

  public event<
    T extends AllowedEvents,
    E extends EventNames<T>
  >(
    emitter: AppEmitter<T>,
    event: E,
    fn: EventListener<T, E>
  ) {
    this.handlers.push(SubscriptionSink.oneshot(emitter, event, fn));
  }

  public unsubscribeAll() {
    while (this.handlers.length) {
      this.handlers.pop()!();
    }
  }
}
