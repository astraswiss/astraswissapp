import { Source_Serif_4, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { formatChf, formatDate } from "@/lib/format";
import { computeTotal, computeVatBreakdown } from "@/lib/store/types";
import type { DocumentPreviewPayload } from "@/lib/chat/document-preview-context";

// Loaded here (not in the root layout) because only this in-app mock of the
// Typst templates needs them — the real PDF fonts are the vendored .ttf
// files in src/typst/fonts, compiled server-side, entirely separate from
// these web fonts.
const sourceSerif4 = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif-4", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

type Address = { street: string; houseNumber: string; postalCode: string; city: string };
type Doc = DocumentPreviewPayload["document"];
type LineItems = Doc["lineItems"];

// Mirrors _shared/layout.typ's `compact-address` — single-line letterhead
// address, "·"-separated, matching the avena-ported templates' punctuation.
function compactAddress(addr: Address) {
  return `${addr.street} ${addr.houseNumber} · ${addr.postalCode} ${addr.city}`;
}

function dueReminder(document: Doc) {
  if (document.kind === "invoice") return `fällig am ${formatDate(document.dueDate)}`;
  if (document.validUntil) return `gültig bis ${formatDate(document.validUntil)}`;
  return null;
}

function sums(lineItems: LineItems) {
  const subtotal = computeTotal(lineItems);
  const breakdown = computeVatBreakdown(lineItems);
  const vatTotal = breakdown.reduce((sum, entry) => sum + entry.amount, 0);
  return { subtotal, breakdown, total: subtotal + vatTotal };
}

function metaItems(document: Doc, isOffer: boolean) {
  const deadline = document.kind === "invoice" ? document.dueDate : document.validUntil;
  const items = [
    { label: isOffer ? "Offerte-Nr." : "Rechnungs-Nr.", value: document.number },
    { label: "Datum", value: formatDate(document.issueDate) },
  ];
  if (deadline) {
    items.push({ label: isOffer ? "Gültig bis" : "Zahlbar bis", value: formatDate(deadline) });
  }
  return items;
}

const paymentNote = (
  <p className="mt-1 text-right text-[7.5px] italic text-ink-faint">
    Zahlbar mit beiliegendem Einzahlungsschein — Seite 2
  </p>
);

// === Variant 1 — "minimal" (mirrors render-minimal in layout.typ) ===
function MinimalPreview({ preview }: { preview: DocumentPreviewPayload }) {
  const { kind, document, company, client } = preview;
  const isOffer = kind === "offer";
  const accent = company.brandingColor;
  const reminder = dueReminder(document);
  const totals = sums(document.lineItems);

  return (
    <div className="text-[10px] text-[#1a1d24]">
      <p className="text-[8px] text-ink-faint">
        <strong className="text-ink">{company.name}</strong> · {compactAddress(company.address)}
      </p>
      <div className="mt-1.5 border-t border-line" />

      <div className="mt-7">
        <p className="text-[11px] font-medium text-ink">{client.name}</p>
        {client.address.street && (
          <p className="text-[11px] text-ink-soft">
            {client.address.street} {client.address.houseNumber}
            <br />
            {client.address.postalCode} {client.address.city}
          </p>
        )}
      </div>

      <div className="mt-8 flex items-end justify-between">
        <p className="text-[22px] font-bold" style={{ color: accent }}>
          {isOffer ? "OFFERTE" : "RECHNUNG"}
        </p>
        <p className="text-[9px] text-ink-faint">
          {company.address.city}, {formatDate(document.issueDate)}
        </p>
      </div>
      <div className="mt-1.5 h-[1.5px]" style={{ backgroundColor: accent }} />

      <div className="mt-3.5 flex gap-8 border-y border-line py-2.5">
        {metaItems(document, isOffer).map((mi) => (
          <div key={mi.label}>
            <p className="text-[7.5px] uppercase tracking-wide text-ink-faint">{mi.label}</p>
            <p className="text-[11px] font-medium">{mi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3.5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2" style={{ borderColor: accent }}>
              <th className="py-1.5 text-left text-[8px] font-bold" style={{ color: accent }}>
                Beschreibung
              </th>
              <th className="py-1.5 text-right text-[8px] font-bold" style={{ color: accent }}>
                Menge
              </th>
              <th className="py-1.5 text-right text-[8px] font-bold" style={{ color: accent }}>
                Preis
              </th>
              <th className="py-1.5 text-right text-[8px] font-bold" style={{ color: accent }}>
                Betrag
              </th>
            </tr>
          </thead>
          <tbody>
            {document.lineItems.map((item) => (
              <tr key={item.id} className="border-b border-line">
                <td className="py-2">{item.description || <span className="text-ink-faint">—</span>}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatChf(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatChf(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 ml-auto w-[62%]">
        <div className="flex flex-col gap-1 text-[9px] text-ink-faint">
          <div className="flex justify-between">
            <span>Zwischensumme</span>
            <span className="text-ink">{formatChf(totals.subtotal)}</span>
          </div>
          {totals.breakdown.map((entry) => (
            <div key={entry.rate} className="flex justify-between">
              <span>MWST {entry.rate}%</span>
              <span className="text-ink">{formatChf(entry.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center justify-between rounded-md px-3.5 py-2.5" style={{ backgroundColor: accent }}>
          <div>
            <p className="text-[10px] font-bold text-white">Total</p>
            {reminder && <p className="text-[7.5px] text-white/70">{reminder}</p>}
          </div>
          <p className="text-[15px] font-bold text-white">{formatChf(totals.total)}</p>
        </div>
        {!isOffer && paymentNote}
      </div>

      {document.note && (
        <p className="mt-4 border-t border-line pt-2 text-[8.5px] text-ink-soft">{document.note}</p>
      )}
    </div>
  );
}

// === Variant 2 — "classic" (mirrors render-classic in layout.typ) ===
function ClassicPreview({ preview }: { preview: DocumentPreviewPayload }) {
  const { kind, document, company, client } = preview;
  const isOffer = kind === "offer";
  const accent = company.brandingColor;
  const reminder = dueReminder(document);
  const totals = sums(document.lineItems);
  const serif = "var(--font-source-serif-4)";

  return (
    <div className="text-[10px] text-[#1a1d24]" style={{ fontFamily: serif }}>
      <div className="rounded px-3.5 py-3" style={{ backgroundColor: accent }}>
        <p className="text-[14px] font-bold text-white">{company.name}</p>
        <p className="text-[8px] text-white/70">{compactAddress(company.address)}</p>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-medium text-ink">{client.name}</p>
        {client.address.street && (
          <p className="text-[11px] text-ink-soft">
            {client.address.street} {client.address.houseNumber}
            <br />
            {client.address.postalCode} {client.address.city}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-end justify-between">
        <p className="text-[19px] font-bold" style={{ color: accent }}>
          {isOffer ? "OFFERTE" : "RECHNUNG"}
        </p>
        <p className="text-[9px] text-ink-faint">
          {company.address.city}, {formatDate(document.issueDate)}
        </p>
      </div>

      <div className="mt-3 flex gap-8 rounded px-3.5 py-2" style={{ backgroundColor: `${accent}18` }}>
        {metaItems(document, isOffer).map((mi) => (
          <div key={mi.label}>
            <p className="text-[7.5px] uppercase tracking-wide" style={{ color: accent }}>
              {mi.label}
            </p>
            <p className="text-[11px] font-medium">{mi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3.5 overflow-hidden rounded">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: accent }}>
              <th className="px-2.5 py-1.5 text-left text-[8px] font-bold text-white">Beschreibung</th>
              <th className="px-2.5 py-1.5 text-right text-[8px] font-bold text-white">Menge</th>
              <th className="px-2.5 py-1.5 text-right text-[8px] font-bold text-white">Preis</th>
              <th className="px-2.5 py-1.5 text-right text-[8px] font-bold text-white">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {document.lineItems.map((item, i) => (
              <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? `${accent}14` : "white" }}>
                <td className="px-2.5 py-2">{item.description || <span className="text-ink-faint">—</span>}</td>
                <td className="px-2.5 py-2 text-right">{item.quantity}</td>
                <td className="px-2.5 py-2 text-right">{formatChf(item.unitPrice)}</td>
                <td className="px-2.5 py-2 text-right">{formatChf(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 ml-auto w-[65%] rounded-md px-3.5 py-3" style={{ border: `1.5px solid ${accent}` }}>
        <div className="flex flex-col gap-1 text-[9px] text-ink-faint">
          <div className="flex justify-between">
            <span>Zwischensumme</span>
            <span className="text-ink">{formatChf(totals.subtotal)}</span>
          </div>
          {totals.breakdown.map((entry) => (
            <div key={entry.rate} className="flex justify-between">
              <span>MWST {entry.rate}%</span>
              <span className="text-ink">{formatChf(entry.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded px-3 py-2" style={{ backgroundColor: accent }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-white">Total</p>
              {reminder && <p className="text-[7.5px] text-white/70">{reminder}</p>}
            </div>
            <p className="text-[15px] font-bold text-white">{formatChf(totals.total)}</p>
          </div>
        </div>
      </div>
      {!isOffer && <div className="ml-auto w-[65%]">{paymentNote}</div>}

      {document.note && (
        <p className="mt-4 border-t border-line pt-2 text-[8.5px] text-ink-soft">{document.note}</p>
      )}
    </div>
  );
}

// === Variant 3 — "bold" (mirrors render-bold in layout.typ: editorial) ===
function BoldPreview({ preview }: { preview: DocumentPreviewPayload }) {
  const { kind, document, company, client } = preview;
  const isOffer = kind === "offer";
  const accent = company.brandingColor;
  const reminder = dueReminder(document);
  const totals = sums(document.lineItems);
  const grotesk = "var(--font-space-grotesk)";

  return (
    <div className="text-[9.5px] text-[#1a1d24]" style={{ fontFamily: grotesk }}>
      <div className="text-right">
        <p className="text-[10px] font-bold">{company.name}</p>
        <p className="text-[8px] text-ink-faint">{compactAddress(company.address)}</p>
      </div>

      <p className="mt-7 text-[28px] font-bold tracking-tight">{isOffer ? "Offerte" : "Rechnung"}</p>

      <div className="mt-5 grid grid-cols-2 gap-6">
        <div>
          <p className="text-[7.5px] uppercase tracking-wide text-ink-faint">Empfänger</p>
          <p className="mt-1 text-[10px] text-ink">{client.name}</p>
          {client.address.street && (
            <p className="text-[10px] text-ink-soft">
              {client.address.street} {client.address.houseNumber}
              <br />
              {client.address.postalCode} {client.address.city}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {metaItems(document, isOffer).map((mi) => (
            <div key={mi.label}>
              <p className="text-[7.5px] uppercase tracking-wide text-ink-faint">{mi.label}</p>
              <p className="text-[10px]">{mi.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-[7.5px] uppercase tracking-wide text-ink-faint">
          <span>Beschreibung</span>
          <span className="text-right">Menge</span>
          <span className="text-right">Preis</span>
          <span className="text-right">Betrag</span>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {document.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-[10px]">
              <span>{item.description || <span className="text-ink-faint">—</span>}</span>
              <span className="text-right">{item.quantity}</span>
              <span className="text-right">{formatChf(item.unitPrice)}</span>
              <span className="text-right">{formatChf(item.quantity * item.unitPrice)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 border-t border-line" />
      </div>

      <div className="mt-4 ml-auto w-[62%]">
        <div className="flex flex-col gap-1 text-[9px] text-ink-faint">
          <div className="flex justify-between">
            <span>Zwischensumme</span>
            <span className="text-ink">{formatChf(totals.subtotal)}</span>
          </div>
          {totals.breakdown.map((entry) => (
            <div key={entry.rate} className="flex justify-between">
              <span>MWST {entry.rate}%</span>
              <span className="text-ink">{formatChf(entry.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 border-t-[1.5px]" style={{ borderColor: accent }} />
        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-[11px]">Total</span>
          <span className="text-[19px] font-bold">{formatChf(totals.total)}</span>
        </div>
        {reminder && <p className="mt-1 text-right text-[7.5px] text-ink-faint">{reminder}</p>}
        {!isOffer && paymentNote}
      </div>

      {document.note && (
        <p className="mt-4 border-t border-line pt-2 text-[8.5px] text-ink-soft">{document.note}</p>
      )}
    </div>
  );
}

/**
 * Fast, network-free stand-in for the real Typst PDF: mirrors the 3
 * templates' structure/spacing 1:1 (see the render-minimal/classic/bold
 * functions in src/typst/templates/_shared/layout.typ, themselves ports of
 * avena's layout-1/2/3) rather than the "same 3 cards with different colors"
 * look this component had before that rewrite — keep the two in sync
 * whenever one changes. Not pixel-exact (HTML, not Typst), and deliberately
 * not an `<iframe>` of the real PDF — see project design-rules memory.
 */
export function DocumentLivePreview({ preview }: { preview: DocumentPreviewPayload }) {
  const variant = preview.document.templateId;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-paper-raised p-4">
      <div
        className={cn(
          "mx-auto max-w-[36rem] rounded-sm bg-white p-8 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.25)]",
          sourceSerif4.variable,
          spaceGrotesk.variable,
        )}
      >
        {variant === "minimal" && <MinimalPreview preview={preview} />}
        {variant === "classic" && <ClassicPreview preview={preview} />}
        {variant === "bold" && <BoldPreview preview={preview} />}
      </div>
    </div>
  );
}
