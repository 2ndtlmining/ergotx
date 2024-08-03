import type { IRect, IVector2 } from "~/common/math";

export type StatsWindowDetails = { type: "stats" };
export type TxWindowDetails = { type: "tx", txId: string };
export type BlockWindowDetails = { type: "block" };

// prettier-ignore
export type WindowDetails =
  | StatsWindowDetails
  | TxWindowDetails
  | BlockWindowDetails;

export interface WindowEntry {
  id: number;
  title: string;
  details: WindowDetails;
  initialPosition?: IVector2 | undefined | null;
  initialSize?: IRect | undefined | null;
}
