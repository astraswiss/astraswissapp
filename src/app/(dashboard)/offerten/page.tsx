"use client";

import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/documents/document-list";
import { useClients, useOffers } from "@/lib/store/hooks";
import { deleteOffer } from "@/lib/store/offers";

export default function OffertenPage() {
  const offers = useOffers();
  const clients = useClients();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Offerten</h1>
        <Button href="/offerten/neu">+ Neue Offerte</Button>
      </div>
      <DocumentList kind="offer" documents={offers} clients={clients} onDelete={deleteOffer} />
    </div>
  );
}
