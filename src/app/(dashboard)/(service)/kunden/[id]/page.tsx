"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ClientForm } from "@/components/clients/client-form";
import { ButtonEl } from "@/components/ui/button";
import { useClients } from "@/lib/store/hooks";
import { updateClient, deleteClient } from "@/lib/store/clients";

export default function KundeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const clients = useClients();
  const client = clients.find((c) => c.id === id);

  if (!client) {
    return <p className="text-sm text-ink-faint">Kunde nicht gefunden.</p>;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{client.name}</h1>
      <ClientForm
        submitLabel="Speichern"
        initialValues={client}
        onSubmit={(values) => updateClient(client.id, values)}
      />
      <ButtonEl
        type="button"
        variant="danger"
        className="self-start"
        onClick={() => {
          if (confirm(`Kunde "${client.name}" wirklich löschen?`)) {
            deleteClient(client.id);
            router.push("/kunden");
          }
        }}
      >
        Kunde löschen
      </ButtonEl>
    </div>
  );
}
