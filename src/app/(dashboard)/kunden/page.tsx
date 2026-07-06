"use client";

import { useState } from "react";
import { ButtonEl } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";
import { ClientList } from "@/components/clients/client-list";
import { useClients } from "@/lib/store/hooks";
import { createClient } from "@/lib/store/clients";

export default function KundenPage() {
  const clients = useClients();
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Kunden</h1>
        {!creating && (
          <ButtonEl type="button" onClick={() => setCreating(true)}>
            + Neuer Kunde
          </ButtonEl>
        )}
      </div>

      {creating && (
        <div className="rounded-xl border border-line p-5">
          <ClientForm
            submitLabel="Kunde anlegen"
            onCancel={() => setCreating(false)}
            onSubmit={(values) => {
              createClient(values);
              setCreating(false);
            }}
          />
        </div>
      )}

      <ClientList clients={clients} />
    </div>
  );
}
