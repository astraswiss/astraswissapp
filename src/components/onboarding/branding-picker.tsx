"use client";

import { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { ButtonEl } from "@/components/ui/button";

export function BrandingPicker({
  companyName,
  onConfirm,
}: {
  companyName: string;
  onConfirm: (color: string) => void;
}) {
  const [color, setColor] = useState("#3454d1");

  return (
    <div className="flex flex-col gap-6">
      <ColorPicker value={color} onChange={setColor} />

      <div className="rounded-xl border border-line shadow-sm">
        <div className="flex items-center justify-between rounded-t-xl px-5 py-4 text-white" style={{ backgroundColor: color }}>
          <span className="font-semibold tracking-tight">{companyName || "Ihre Firma"}</span>
          <span className="font-mono text-sm opacity-90">RE-{new Date().getFullYear()}-0001</span>
        </div>
        <div className="space-y-2 rounded-b-xl bg-paper px-5 py-4">
          <div className="h-2 w-3/4 rounded-full bg-paper-raised" />
          <div className="h-2 w-1/2 rounded-full bg-paper-raised" />
        </div>
      </div>
      <p className="text-sm text-ink-faint">
        Dieser Farbton erscheint nur auf Ihren Rechnungen und Offerten — nicht in der Astra-Oberfläche.
      </p>

      <ButtonEl type="button" className="self-start" onClick={() => onConfirm(color)}>
        Fertigstellen
      </ButtonEl>
    </div>
  );
}
