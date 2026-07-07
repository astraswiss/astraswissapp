"use client";

import { useEffect, useState } from "react";
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
import { useDocumentPreview } from "@/lib/chat/document-preview-context";
import { setDefaultTemplate } from "@/lib/store/company";
import { createInvoice, updateInvoice } from "@/lib/store/invoices";
import { createOffer, updateOffer } from "@/lib/store/offers";
import type { Client, Invoice, InvoiceStatus, LineItem, Offer, OfferStatus, TemplateId } from "@/lib/store/types";
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
  const { showPreview, clearPreview } = useDocumentPreview();
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
  const client = clients.find((c) => c.id === common.clientId);
  // Placeholder so the preview can start the instant the page opens, before
  // a client is even picked — real client data fills in as soon as one is
  // chosen (see the effect below).
  const previewClient: Client = client ?? {
    id: "preview",
    name: "Kunde folgt…",
    address: { street: "", houseNumber: "", postalCode: "", city: "", country: "CH" },
    createdAt: "",
    updatedAt: "",
  };

  // Live preview: as soon as a template is selected, keep the docked panel
  // showing a live render of the in-progress draft — starts immediately on
  // entering the page (once company.defaultTemplateId is set) rather than
  // waiting for "Speichern". The panel reverts to chat when this form
  // unmounts (see the cleanup effect below), i.e. when navigating away.
  useEffect(() => {
    if (!company || !common.templateId) return;
    const templateId = common.templateId as TemplateId;
    const now = new Date().toISOString();
    const draft: Invoice | Offer =
      kind === "invoice"
        ? {
            id: existingDoc?.id ?? "draft",
            kind: "invoice",
            number: existingDoc?.number ?? "VORSCHAU",
            clientId: common.clientId,
            templateId,
            lineItems: common.lineItems,
            currency: "CHF",
            issueDate: common.issueDate,
            note: common.note || undefined,
            status: invoiceStatus,
            dueDate,
            referenceType: "NON",
            createdAt: existingDoc?.createdAt ?? now,
            updatedAt: now,
          }
        : {
            id: existingDoc?.id ?? "draft",
            kind: "offer",
            number: existingDoc?.number ?? "VORSCHAU",
            clientId: common.clientId,
            templateId,
            lineItems: common.lineItems,
            currency: "CHF",
            issueDate: common.issueDate,
            note: common.note || undefined,
            status: offerStatus,
            validUntil: validUntil || undefined,
            createdAt: existingDoc?.createdAt ?? now,
            updatedAt: now,
          };

    // Short debounce only to avoid re-rendering the preview on every
    // keystroke — this is a pure client-side render now (no PDF compile
    // round-trip), so it can afford to feel near-instant.
    const timeout = setTimeout(() => {
      showPreview({ kind, document: draft, company, client: previewClient });
    }, 150);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, previewClient, kind, common, invoiceStatus, dueDate, offerStatus, validUntil]);

  // Revert the docked panel to chat once this form is no longer on screen.
  useEffect(() => () => clearPreview(), [clearPreview]);

  if (!company) return null;

  function handleSave() {
    if (!company || !common.clientId || !common.templateId || !client) return;
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
      showPreview({ kind: "invoice", document: saved, company, client });
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
      showPreview({ kind: "offer", document: saved, company, client });
      props.onSaved(saved);
    }
  }

  return (
    <div className="flex flex-col gap-5">
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

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Vorlage</label>
              <Select
                value={common.templateId}
                onChange={(event) => setCommon((prev) => ({ ...prev, templateId: event.target.value as TemplateId }))}
              >
                <option value="minimal">Minimal</option>
                <option value="classic">Classic</option>
                <option value="bold">Bold</option>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Status</label>
              {kind === "invoice" ? (
                <Select
                  value={invoiceStatus}
                  onChange={(event) => setInvoiceStatus(event.target.value as InvoiceStatus)}
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
                >
                  {OFFER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              )}
            </div>
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
              rows={2}
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
