import { listCollection, nextDocumentNumber, saveCollection } from "./storage";
import type { Offer } from "./types";

const KEY = "offers" as const;

export type OfferInput = Omit<Offer, "id" | "kind" | "number" | "createdAt" | "updatedAt">;

export function listOffers(): Offer[] {
  return listCollection<Offer>(KEY).sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}

export function getOffer(id: string): Offer | null {
  return listOffers().find((offer) => offer.id === id) ?? null;
}

export function createOffer(input: OfferInput): Offer {
  const now = new Date().toISOString();
  const existing = listCollection<Offer>(KEY);
  const offer: Offer = {
    ...input,
    id: crypto.randomUUID(),
    kind: "offer",
    number: nextDocumentNumber("OF", existing),
    createdAt: now,
    updatedAt: now,
  };
  saveCollection(KEY, [...existing, offer]);
  return offer;
}

export function updateOffer(id: string, patch: Partial<OfferInput>): Offer {
  const now = new Date().toISOString();
  let updated: Offer | null = null;
  const items = listCollection<Offer>(KEY).map((offer) => {
    if (offer.id !== id) return offer;
    updated = { ...offer, ...patch, updatedAt: now };
    return updated;
  });
  if (!updated) throw new Error(`Offerte ${id} nicht gefunden.`);
  saveCollection(KEY, items);
  return updated;
}

export function deleteOffer(id: string): void {
  saveCollection(
    KEY,
    listCollection<Offer>(KEY).filter((offer) => offer.id !== id),
  );
}
