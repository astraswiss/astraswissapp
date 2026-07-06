"use client";

import { useSyncExternalStore } from "react";
import { storeEvents } from "./storage";
import { getCompany } from "./company";
import { listClients } from "./clients";
import { listInvoices } from "./invoices";
import { listOffers } from "./offers";
import type { Client, Company, Invoice, Offer } from "./types";

function subscribe(callback: () => void) {
  storeEvents.addEventListener("change", callback);
  return () => storeEvents.removeEventListener("change", callback);
}

/** Caches the computed snapshot until the store reports a change, so `useSyncExternalStore` doesn't see a new reference on every render (which would otherwise trigger React's "getSnapshot should be cached" loop). */
function createSnapshotGetter<T>(compute: () => T) {
  let cache: T | undefined;
  let dirty = true;
  storeEvents.addEventListener("change", () => {
    dirty = true;
  });
  return () => {
    if (dirty) {
      cache = compute();
      dirty = false;
    }
    return cache as T;
  };
}

const getCompanySnapshot = createSnapshotGetter(getCompany);
const getClientsSnapshot = createSnapshotGetter(listClients);
const getInvoicesSnapshot = createSnapshotGetter(listInvoices);
const getOffersSnapshot = createSnapshotGetter(listOffers);

const EMPTY_CLIENTS: Client[] = [];
const EMPTY_INVOICES: Invoice[] = [];
const EMPTY_OFFERS: Offer[] = [];
const NO_COMPANY: Company | null = null;

export function useCompany(): Company | null {
  return useSyncExternalStore(subscribe, getCompanySnapshot, () => NO_COMPANY);
}

export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, getClientsSnapshot, () => EMPTY_CLIENTS);
}

export function useInvoices(): Invoice[] {
  return useSyncExternalStore(subscribe, getInvoicesSnapshot, () => EMPTY_INVOICES);
}

export function useOffers(): Offer[] {
  return useSyncExternalStore(subscribe, getOffersSnapshot, () => EMPTY_OFFERS);
}
