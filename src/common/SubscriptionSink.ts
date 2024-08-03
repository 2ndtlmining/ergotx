import EventEmitter from "eventemitter3";
import type { VoidCallback } from "./types";

export class SubscriptionSink {
  private handlers: VoidCallback[];

  public constructor() {
    this.handlers = [];
  }

  public static oneshot<
    EventTypes extends EventEmitter.ValidEventTypes,
    T extends EventEmitter.EventNames<EventTypes>
  >(
    emitter: EventEmitter<EventTypes, any>,
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>
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
    EventTypes extends EventEmitter.ValidEventTypes,
    T extends EventEmitter.EventNames<EventTypes>
  >(
    emitter: EventEmitter<EventTypes, any>,
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>
  ) {
    this.handlers.push(SubscriptionSink.oneshot(emitter, event, fn));
  }

  public unsubscribeAll() {
    while (this.handlers.length) {
      this.handlers.pop()!();
    }
  }
}

/* ================== */

type AllowedEvents = Record<string, any>;
type EventNames<T> = keyof T;
type EventPayload<T, E extends EventNames<T>> = T[E];
type EventListener<T, E extends EventNames<T>> = VoidCallback<
  EventPayload<T, E>
>;

// The built-in typings for EventEmitter are horribly broken. Here we implement
// a fresh and simple set of typings for it according to our needs.
// ...
// @ts-ignore
class TypedEventEmitter<T extends AllowedEvents> extends EventEmitter<keyof T> {
  // @ts-ignore
  public on<E extends EventNames<T>>(
    event: E,
    fn: EventListener<T, E>,
    context?: any
  ): this {
    return (super.on as any)(event, fn, context);
  }

  // @ts-ignore
  public off<E extends EventNames<T>>(
    event: E,
    fn: EventListener<T, E>,
    context?: any,
    once?: boolean
  ): this {
    return (super.off as any)(event, fn, context, once);
  }

  // @ts-ignore
  public emit<E extends EventNames<T>>(event: E, payload: T[E]): boolean {
    return (super.emit as any)(event, payload);
  }
}

// interface TargetEvents {
//   a: string;
//   b: [number, string];
// }

// class Target extends TypedEventEmitter<TargetEvents> {}

// function foo<T extends AllowedEvents, E extends EventNames<T>>(
//   emitter: TypedEventEmitter<T>,
//   event: E,
//   fn: EventListener<T, E>
// ) {
//   emitter.on(event, fn);
// }

// declare let t: Target;
// foo(t, "a", dawdwa => {});
