"use client";

import { useState } from "react";
import Link from "next/link";
import { ButtonEl } from "@/components/ui/button";
import type { Client } from "@/lib/store/types";
import { deleteClient } from "@/lib/store/clients";

export function ClientList({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");
  const filtered = clients.filter((client) =>
    client.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (clients.length === 0) {
    return <p className="text-sm text-ink-faint">Noch keine Kunden erfasst.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Kunden durchsuchen…"
        className="w-full max-w-xs rounded-lg border border-line bg-paper px-3.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
      />
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-paper-raised text-xs font-medium uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Ort</th>
              <th className="px-4 py-3 text-left">E-Mail</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/kunden/${client.id}`} className="font-medium text-ink hover:text-accent">
                    {client.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {client.address.postalCode} {client.address.city}
                </td>
                <td className="px-4 py-3 text-ink-soft">{client.email || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <ButtonEl
                    type="button"
                    variant="subtle"
                    className="px-2 py-1 text-xs"
                    onClick={() => {
                      if (confirm(`Kunde "${client.name}" wirklich löschen?`)) {
                        deleteClient(client.id);
                      }
                    }}
                  >
                    Löschen
                  </ButtonEl>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
