"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { ButtonEl } from "@/components/ui/button";
import { ClientForm } from "./client-form";
import { useClients } from "@/lib/store/hooks";
import { createClient } from "@/lib/store/clients";

export function ClientPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (clientId: string) => void;
}) {
  const clients = useClients();
  const [creating, setCreating] = useState(false);

  if (creating) {
    return (
      <div className="rounded-xl border border-line p-4">
        <ClientForm
          submitLabel="Kunde anlegen"
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            const client = createClient(values);
            onChange(client.id);
            setCreating(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onChange={(event) => onChange(event.target.value)} className="flex-1">
        <option value="">Kunde auswählen…</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </Select>
      <ButtonEl type="button" variant="secondary" onClick={() => setCreating(true)}>
        + Neuer Kunde
      </ButtonEl>
    </div>
  );
}
