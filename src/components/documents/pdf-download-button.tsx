"use client";

import { useState } from "react";
import { ButtonEl } from "@/components/ui/button";
import type { Client, Company, Invoice, Offer } from "@/lib/store/types";

export function PdfDownloadButton({
  kind,
  doc,
  company,
  client,
}: {
  kind: "invoice" | "offer";
  doc: Invoice | Offer;
  company: Company;
  client: Client;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const endpoint = kind === "invoice" ? "invoices" : "offers";
      const res = await fetch(`/api/${endpoint}/${doc.id}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: doc, company, client }),
      });
      if (!res.ok) throw new Error("PDF-Erstellung fehlgeschlagen.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `${doc.number}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <ButtonEl type="button" variant="secondary" onClick={handleDownload} disabled={loading}>
        {loading ? "Erstelle PDF…" : "PDF herunterladen"}
      </ButtonEl>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
