"use client";

import { Input } from "@/components/ui/input";
import { ButtonEl } from "@/components/ui/button";
import { formatChf } from "@/lib/format";
import type { LineItem } from "@/lib/store/types";

const VAT_RATES = [8.1, 3.8, 2.6, 0];

export function emptyLineItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, vatRate: 8.1 };
}

function VatSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-lg border border-line bg-paper px-2 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
    >
      {VAT_RATES.map((rate) => (
        <option key={rate} value={rate}>
          {rate}
        </option>
      ))}
    </select>
  );
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
      {children}
    </div>
  );
}

export function LineItemEditor({
  items,
  onChange,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  function update(id: string, patch: Partial<LineItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden grid-cols-[1fr_5rem_7rem_6rem_7rem_2rem] gap-2 px-1 text-xs font-medium uppercase tracking-wide text-ink-faint sm:grid">
        <span>Beschreibung</span>
        <span>Menge</span>
        <span>Preis</span>
        <span>MWST %</span>
        <span className="text-right">Total</span>
        <span />
      </div>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-line p-3 sm:border-0 sm:p-0">
          {/* Mobile: stacked card */}
          <div className="flex flex-col gap-3 sm:hidden">
            <div className="flex items-start gap-2">
              <Input
                value={item.description}
                onChange={(event) => update(item.id, { description: event.target.value })}
                placeholder="Arbeit, Material, …"
                className="flex-1"
              />
              <ButtonEl
                type="button"
                variant="subtle"
                className="px-2 py-2 text-xs"
                onClick={() => remove(item.id)}
                aria-label="Position entfernen"
              >
                ✕
              </ButtonEl>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniField label="Menge">
                <Input
                  type="number"
                  min={0}
                  step="0.25"
                  value={item.quantity}
                  onChange={(event) => update(item.id, { quantity: Number(event.target.value) })}
                />
              </MiniField>
              <MiniField label="Preis">
                <Input
                  type="number"
                  min={0}
                  step="0.05"
                  value={item.unitPrice}
                  onChange={(event) => update(item.id, { unitPrice: Number(event.target.value) })}
                />
              </MiniField>
              <MiniField label="MWST %">
                <VatSelect value={item.vatRate} onChange={(vatRate) => update(item.id, { vatRate })} />
              </MiniField>
              <MiniField label="Total">
                <span className="flex h-[2.625rem] items-center font-mono text-sm text-ink-soft">
                  {formatChf(item.quantity * item.unitPrice)}
                </span>
              </MiniField>
            </div>
          </div>

          {/* Desktop: single row */}
          <div className="hidden grid-cols-[1fr_5rem_7rem_6rem_7rem_2rem] items-center gap-2 sm:grid">
            <Input
              value={item.description}
              onChange={(event) => update(item.id, { description: event.target.value })}
              placeholder="Arbeit, Material, …"
            />
            <Input
              type="number"
              min={0}
              step="0.25"
              value={item.quantity}
              onChange={(event) => update(item.id, { quantity: Number(event.target.value) })}
            />
            <Input
              type="number"
              min={0}
              step="0.05"
              value={item.unitPrice}
              onChange={(event) => update(item.id, { unitPrice: Number(event.target.value) })}
            />
            <VatSelect value={item.vatRate} onChange={(vatRate) => update(item.id, { vatRate })} />
            <span className="text-right font-mono text-sm text-ink-soft">
              {formatChf(item.quantity * item.unitPrice)}
            </span>
            <ButtonEl
              type="button"
              variant="subtle"
              className="px-1 py-1 text-xs"
              onClick={() => remove(item.id)}
              aria-label="Position entfernen"
            >
              ✕
            </ButtonEl>
          </div>
        </div>
      ))}
      <ButtonEl
        type="button"
        variant="secondary"
        className="self-start"
        onClick={() => onChange([...items, emptyLineItem()])}
      >
        + Position
      </ButtonEl>
    </div>
  );
}
