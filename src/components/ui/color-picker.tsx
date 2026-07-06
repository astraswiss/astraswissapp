"use client";

import { cn } from "@/lib/utils";

export const BRAND_COLOR_SWATCHES = [
  "#3454d1",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#6d28d9",
  "#15803d",
  "#0369a1",
  "#0b0d12",
];

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        {BRAND_COLOR_SWATCHES.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={swatch}
            onClick={() => onChange(swatch)}
            className={cn(
              "h-9 w-9 rounded-full border-2 transition-transform",
              value.toLowerCase() === swatch ? "scale-110 border-ink" : "border-transparent hover:scale-105",
            )}
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>
      <label className="flex items-center gap-3 text-sm text-ink-soft">
        Eigener Farbton
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-14 cursor-pointer rounded-lg border border-line bg-paper p-1"
        />
        <span className="font-mono text-xs text-ink-faint">{value}</span>
      </label>
    </div>
  );
}
