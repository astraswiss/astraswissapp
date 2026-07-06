import { listCollection, saveCollection } from "./storage";
import type { Client } from "./types";

const KEY = "clients" as const;

export type ClientInput = Omit<Client, "id" | "createdAt" | "updatedAt">;

export function listClients(): Client[] {
  return listCollection<Client>(KEY).sort((a, b) => a.name.localeCompare(b.name));
}

export function getClient(id: string): Client | null {
  return listClients().find((client) => client.id === id) ?? null;
}

export function createClient(input: ClientInput): Client {
  const now = new Date().toISOString();
  const client: Client = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  saveCollection(KEY, [...listCollection<Client>(KEY), client]);
  return client;
}

export function updateClient(id: string, patch: Partial<ClientInput>): Client {
  const now = new Date().toISOString();
  let updated: Client | null = null;
  const items = listCollection<Client>(KEY).map((client) => {
    if (client.id !== id) return client;
    updated = { ...client, ...patch, updatedAt: now };
    return updated;
  });
  if (!updated) throw new Error(`Kunde ${id} nicht gefunden.`);
  saveCollection(KEY, items);
  return updated;
}

export function deleteClient(id: string): void {
  saveCollection(
    KEY,
    listCollection<Client>(KEY).filter((client) => client.id !== id),
  );
}
