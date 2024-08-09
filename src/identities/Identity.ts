import { Transaction } from "~/common/types";

export interface Identity {
  name: string;
  index: number;
  addresses: Set<string>;
}

const registeredTxIdentities: Identity[] = [];

function register(name: string, addresses: string[]) {
  let index = registeredTxIdentities.length;
  registeredTxIdentities.push({
    name,
    index,
    addresses: new Set(addresses)
  });
}

export function identityOf(tx: Transaction): Readonly<Identity> | null {
  return registeredTxIdentities.find(iden => iden.addresses.has(tx.id)) ?? null;
}

export function getAllIdentities(): Array<Readonly<Identity>> {
  return [...registeredTxIdentities];
}

export function getIdentityAt(index: number): Readonly<Identity> {
  return registeredTxIdentities[index];
}

/* =================== */

register("Spectrum FI", []);
register("Rosen Bridge", []);
register("Duckpools", []);
// register("Sigma FI", []);
