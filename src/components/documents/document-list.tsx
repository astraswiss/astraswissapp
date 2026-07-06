"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonEl } from "@/components/ui/button";
import { computeTotal } from "@/lib/store/types";
import type { Client, Invoice, InvoiceStatus, Offer, OfferStatus } from "@/lib/store/types";
import { formatChf, formatDate } from "@/lib/format";

const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  entwurf: "Entwurf",
  versendet: "Versendet",
  bezahlt: "Bezahlt",
};

const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  entwurf: "Entwurf",
  versendet: "Versendet",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
};

function statusTone(status: string) {
  if (status === "bezahlt" || status === "angenommen") return "success" as const;
  if (status === "abgelehnt") return "danger" as const;
  if (status === "versendet") return "accent" as const;
  return "neutral" as const;
}

export function DocumentList({
  kind,
  documents,
  clients,
  onDelete,
}: {
  kind: "invoice" | "offer";
  documents: (Invoice | Offer)[];
  clients: Client[];
  onDelete: (id: string) => void;
}) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        Noch keine {kind === "invoice" ? "Rechnungen" : "Offerten"} erstellt.
      </p>
    );
  }

  const basePath = kind === "invoice" ? "/rechnungen" : "/offerten";

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead className="bg-paper-raised text-xs font-medium uppercase tracking-wide text-ink-faint">
          <tr>
            <th className="px-4 py-3 text-left">Nummer</th>
            <th className="px-4 py-3 text-left">Kunde</th>
            <th className="px-4 py-3 text-left">Datum</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const client = clients.find((c) => c.id === doc.clientId);
            const label =
              doc.kind === "invoice" ? INVOICE_STATUS_LABEL[doc.status] : OFFER_STATUS_LABEL[doc.status];
            return (
              <tr key={doc.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`${basePath}/${doc.id}`} className="font-mono text-ink hover:text-accent">
                    {doc.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{client?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(doc.issueDate)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(doc.status)}>{label}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-ink-soft">
                  {formatChf(computeTotal(doc.lineItems))}
                </td>
                <td className="px-4 py-3 text-right">
                  <ButtonEl
                    type="button"
                    variant="subtle"
                    className="px-2 py-1 text-xs"
                    onClick={() => {
                      if (confirm(`${doc.number} wirklich löschen?`)) onDelete(doc.id);
                    }}
                  >
                    Löschen
                  </ButtonEl>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
