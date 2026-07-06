import { computeTotal, computeVatBreakdown, type LineItem } from "@/lib/store/types";
import { formatChf } from "@/lib/format";

export function TotalsSummary({ items }: { items: LineItem[] }) {
  const subtotal = computeTotal(items);
  const vatBreakdown = computeVatBreakdown(items);
  const vatTotal = vatBreakdown.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="ml-auto flex w-full max-w-xs flex-col gap-1.5 text-sm">
      <div className="flex justify-between text-ink-soft">
        <span>Zwischensumme</span>
        <span className="font-mono">{formatChf(subtotal)}</span>
      </div>
      {vatBreakdown.map((entry) => (
        <div key={entry.rate} className="flex justify-between text-ink-soft">
          <span>MWST {entry.rate}%</span>
          <span className="font-mono">{formatChf(entry.amount)}</span>
        </div>
      ))}
      <div className="mt-1 flex justify-between border-t border-line pt-1.5 font-semibold text-ink">
        <span>Total</span>
        <span className="font-mono">{formatChf(subtotal + vatTotal)}</span>
      </div>
    </div>
  );
}
