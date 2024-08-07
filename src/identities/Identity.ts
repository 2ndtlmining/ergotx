import { Transaction } from "~/common/types";

export interface Identity {
  name: string;
  index: number;
  addresses: Set<string>;
}

const registeredIdentities: Identity[] = [];

function register(name: string, addresses: string[]) {
  let index = registeredIdentities.length;
  registeredIdentities.push({
    name,
    index,
    addresses: new Set(addresses)
  });
}

export function identityOf(tx: Transaction): Readonly<Identity> | null {
  return registeredIdentities.find(iden => iden.addresses.has(tx.id)) ?? null;
}

export function getAllIdentities(): Array<Readonly<Identity>> {
  return [...registeredIdentities];
}

export function getIdentityAt(index: number): Readonly<Identity> {
  return registeredIdentities[index];
}

/* =================== */

register("Spectrum FI", []);
register("Rosen Bridge", []);
register("Duckpools", []);
register("Sigma FI", []);
