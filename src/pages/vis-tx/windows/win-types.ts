import type { ThinVector } from "~/math/vector";
import type { IRect } from "~/math/rect";

export type StatsWindowDetails = { type: "stats" };
export type TxWindowDetails = { type: "tx"; txId: string };
export type BlockWindowDetails = { type: "block" };
export type SponserErgoWindowDetails = { type: "sponser-ergo" };

// prettier-ignore
export type WindowDetails =
  | StatsWindowDetails
  | TxWindowDetails
  | BlockWindowDetails
  | SponserErgoWindowDetails;

export interface WindowEntry {
  id: number;
  title: string;
  details: WindowDetails;
  initialPosition?: ThinVector | undefined | null;
  initialSize?: IRect | undefined | null;
}
