import { Transaction } from "~/types/ergo";
import { addressBook } from "@conf/address-book";

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
  for (const input of tx.inputs) {
    let found =
      registeredTxIdentities.find(iden => iden.addresses.has(input.address)) ??
      null;
    if (found) return found;
  }
  return null;
}

export function identityOfAddr(address: string): Readonly<Identity> | null {
  return (
    registeredTxIdentities.find(iden => {
      return iden.addresses.has(address);
    }) ?? null
  );
}
// (<any>window).identityOfAddr = identityOfAddr;

export function getAllIdentities(): Array<Readonly<Identity>> {
  return [...registeredTxIdentities];
}

export function getIdentityAt(index: number): Readonly<Identity> {
  return registeredTxIdentities[index];
}

/* =================== */

// register("Spectrum FI", []);
// register("Rosen Bridge", []);
// register("Duckpools", []);
// register("Sigma FI", []);

for (const entry of addressBook) {
  register(entry.name, entry.addresses);
}
