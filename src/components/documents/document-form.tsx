"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ButtonEl } from "@/components/ui/button";
import { ClientPicker } from "@/components/clients/client-picker";
import { LineItemEditor, emptyLineItem } from "@/components/documents/line-item-editor";
import { TotalsSummary } from "@/components/documents/totals-summary";
import { PdfDownloadButton } from "@/components/documents/pdf-download-button";
import { TemplateGallery } from "@/components/templates/template-gallery";
import { useCompany, useClients } from "@/lib/store/hooks";
import { setDefaultTemplate } from "@/lib/store/company";
import { createInvoice, updateInvoice } from "@/lib/store/invoices";
import { createOffer, updateOffer } from "@/lib/store/offers";
import type { Invoice, InvoiceStatus, LineItem, Offer, OfferStatus, TemplateId } from "@/lib/store/types";
import { todayIso } from "@/lib/format";

const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
  { value: "entwurf", label: "Entwurf" },
  { value: "versendet", label: "Versendet" },
  { value: "bezahlt", label: "Bezahlt" },
];

const OFFER_STATUSES: { value: OfferStatus; label: string }[] = [
  { value: "entwurf", label: "Entwurf" },
  { value: "versendet", label: "Versendet" },
  { value: "angenommen", label: "Angenommen" },
  { value: "abgelehnt", label: "Abgelehnt" },
];

type CommonState = {
  clientId: string;
  templateId: TemplateId | "";
  lineItems: LineItem[];
  note: string;
  issueDate: string;
};

type DocumentFormProps =
  | { kind: "invoice"; existing?: Invoice; onSaved: (invoice: Invoice) => void }
  | { kind: "offer"; existing?: Offer; onSaved: (offer: Offer) => void };

export function DocumentForm(props: DocumentFormProps) {
  const { kind, existing } = props;
  const company = useCompany();
  const clients = useClients();
  const existingDoc = existing as Invoice | Offer | undefined;

  const [common, setCommon] = useState<CommonState>({
    clientId: existingDoc?.clientId ?? "",
    templateId: existingDoc?.templateId ?? company?.defaultTemplateId ?? "",
    lineItems: existingDoc?.lineItems ?? [emptyLineItem()],
    note: existingDoc?.note ?? "",
    issueDate: existingDoc?.issueDate ?? todayIso(),
  });
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>(
    kind === "invoice" ? ((existingDoc as Invoice | undefined)?.status ?? "entwurf") : "entwurf",
  );
  const [dueDate, setDueDate] = useState(
    (existingDoc as Invoice | undefined)?.dueDate ?? todayIso(),
  );
  const [offerStatus, setOfferStatus] = useState<OfferStatus>(
    kind === "offer" ? ((existingDoc as Offer | undefined)?.status ?? "entwurf") : "entwurf",
  );
  const [validUntil, setValidUntil] = useState((existingDoc as Offer | undefined)?.validUntil ?? "");

  const needsTemplateChoice = !common.templateId;

  if (!company) return null;

  const client = clients.find((c) => c.id === common.clientId);

  function handleSave() {
    if (!company || !common.clientId || !common.templateId) return;
    const templateId = common.templateId as TemplateId;
    if (!company.defaultTemplateId) setDefaultTemplate(templateId);

    if (props.kind === "invoice") {
      const base = {
        clientId: common.clientId,
        templateId,
        lineItems: common.lineItems,
        currency: "CHF" as const,
        issueDate: common.issueDate,
        note: common.note || undefined,
        status: invoiceStatus,
        dueDate,
        referenceType: "NON" as const,
      };
      const saved = existingDoc ? updateInvoice(existingDoc.id, base) : createInvoice(base);
      props.onSaved(saved);
    } else {
      const base = {
        clientId: common.clientId,
        templateId,
        lineItems: common.lineItems,
        currency: "CHF" as const,
        issueDate: common.issueDate,
        note: common.note || undefined,
        status: offerStatus,
        validUntil: validUntil || undefined,
      };
      const saved = existingDoc ? updateOffer(existingDoc.id, base) : createOffer(base);
      props.onSaved(saved);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {needsTemplateChoice && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Vorlage wählen</h2>
          <p className="text-sm text-ink-soft">
            Diese Wahl wird als Standard für zukünftige {kind === "invoice" ? "Rechnungen" : "Offerten"} gespeichert.
          </p>
          <TemplateGallery
            brandingColor={company.brandingColor}
            value={common.templateId || undefined}
            onSelect={(id) => setCommon((prev) => ({ ...prev, templateId: id }))}
          />
        </section>
      )}

      {!needsTemplateChoice && (
        <>
          <section className="flex flex-col gap-3">
            <label className="text-sm font-medium text-ink">Kunde</label>
            <ClientPicker
              value={common.clientId}
              onChange={(clientId) => setCommon((prev) => ({ ...prev, clientId }))}
            />
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Datum</label>
              <Input
                type="date"
                value={common.issueDate}
                onChange={(event) => setCommon((prev) => ({ ...prev, issueDate: event.target.value }))}
              />
            </div>
            {kind === "invoice" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Fällig am</label>
                <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Gültig bis</label>
                <Input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
              </div>
            )}
          </section>

          <section className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Vorlage</label>
            <Select
              value={common.templateId}
              onChange={(event) => setCommon((prev) => ({ ...prev, templateId: event.target.value as TemplateId }))}
              className="max-w-xs"
            >
              <option value="minimal">Minimal</option>
              <option value="classic">Classic</option>
              <option value="bold">Bold</option>
            </Select>
          </section>

          <section className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Status</label>
            {kind === "invoice" ? (
              <Select
                value={invoiceStatus}
                onChange={(event) => setInvoiceStatus(event.target.value as InvoiceStatus)}
                className="max-w-xs"
              >
                {INVOICE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Select
                value={offerStatus}
                onChange={(event) => setOfferStatus(event.target.value as OfferStatus)}
                className="max-w-xs"
              >
                {OFFER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Positionen</h2>
            <LineItemEditor
              items={common.lineItems}
              onChange={(items) => setCommon((prev) => ({ ...prev, lineItems: items }))}
            />
            <TotalsSummary items={common.lineItems} />
          </section>

          <section className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Notiz (optional)</label>
            <Textarea
              rows={3}
              value={common.note}
              onChange={(event) => setCommon((prev) => ({ ...prev, note: event.target.value }))}
            />
          </section>

          <div className="flex items-center gap-3">
            <ButtonEl type="button" onClick={handleSave} disabled={!common.clientId}>
              Speichern
            </ButtonEl>
            {existingDoc && client && (
              <PdfDownloadButton kind={kind} doc={existingDoc} company={company} client={client} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
