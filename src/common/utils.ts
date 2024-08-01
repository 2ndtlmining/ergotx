import type EventEmitter from "eventemitter3";

export function delay(ms: number): Promise<void> {
  if (ms === 0) return Promise.resolve();
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function autoSubscribe<
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

/**
 * Formats the given number as string
 */
export function formatNumber(
  num: number,
  opts?: {
    // Max number of decimal places (0 means output will be integer)
    // The default is 2
    mantissa?: number;

    // `always` -> always show exactly `mantissa` digits after decimal point, pad with zeros if needed
    // 'auto' -> show up to `mantissa` as needed.
    // The default is `auto`
    mantissaMode?: "always" | "auto";

    // Include commas as thousand separators in the integer part of the number
    // The default is true
    thousandSeparator?: boolean;
  }
): string {
  // Set default values
  const mantissa = opts?.mantissa ?? 2;
  const mantissaMode = opts?.mantissaMode ?? "auto";
  const thousandSeparator = opts?.thousandSeparator ?? true;

  let formattedNumber: string;

  // Format the number based on the options
  if (mantissaMode === "always") {
    formattedNumber = num.toFixed(mantissa);
  } else {
    // "auto" mode
    const factor = Math.pow(10, mantissa);
    formattedNumber = (Math.round(num * factor) / factor).toString();
  }

  // Add thousand separators if needed
  if (thousandSeparator) {
    const parts = formattedNumber.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formattedNumber = parts.join(".");
  }

  return formattedNumber;
}

(<any>window).formatNumber = formatNumber;