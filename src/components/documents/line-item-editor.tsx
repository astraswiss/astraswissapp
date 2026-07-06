"use client";

import { Input } from "@/components/ui/input";
import { ButtonEl } from "@/components/ui/button";
import { formatChf } from "@/lib/format";
import type { LineItem } from "@/lib/store/types";

const VAT_RATES = [8.1, 3.8, 2.6, 0];

export function emptyLineItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, vatRate: 8.1 };
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
      <div className="grid grid-cols-[1fr_5rem_7rem_6rem_7rem_2rem] gap-2 px-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
        <span>Beschreibung</span>
        <span>Menge</span>
        <span>Preis</span>
        <span>MWST %</span>
        <span className="text-right">Total</span>
        <span />
      </div>
      {items.map((item) => (
        <div key={item.id} className="grid grid-cols-[1fr_5rem_7rem_6rem_7rem_2rem] items-center gap-2">
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
          <select
            value={item.vatRate}
            onChange={(event) => update(item.id, { vatRate: Number(event.target.value) })}
            className="w-full rounded-lg border border-line bg-paper px-2 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          >
            {VAT_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </select>
          <span className="text-right font-mono text-sm text-ink-soft">
            {formatChf(item.quantity * item.unitPrice)}
          </span>
          <ButtonEl
            type="button"
            variant="subtle"
            className="px-1 py-1 text-xs"
            onClick={() => remove(item.id)}
          >
            ✕
          </ButtonEl>
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
