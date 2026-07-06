"use client";

import { use } from "react";
import { DocumentForm } from "@/components/documents/document-form";
import { useOffers } from "@/lib/store/hooks";

export default function OfferteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const offers = useOffers();
  const offer = offers.find((o) => o.id === id);

  if (!offer) {
    return <p className="text-sm text-ink-faint">Offerte nicht gefunden.</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Offerte {offer.number}</h1>
      <DocumentForm kind="offer" existing={offer} onSaved={() => {}} />
    </div>
  );
}
