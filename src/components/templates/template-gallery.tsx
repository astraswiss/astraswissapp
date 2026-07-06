"use client";

import { cn } from "@/lib/utils";
import type { TemplateId } from "@/lib/store/types";

const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "minimal", name: "Minimal", description: "Schlicht, viel Weissraum, dünne Akzentlinie." },
  { id: "classic", name: "Classic", description: "Klassisches Briefkopf-Layout mit Rahmen." },
  { id: "bold", name: "Bold", description: "Kräftiges farbiges Kopfband." },
];

function TemplatePreview({ id, color }: { id: TemplateId; color: string }) {
  if (id === "bold") {
    return (
      <div className="overflow-hidden rounded-lg border border-line">
        <div className="px-3 py-2.5 text-white" style={{ backgroundColor: color }}>
          <div className="h-1.5 w-2/3 rounded-full bg-white/70" />
        </div>
        <div className="space-y-1.5 bg-paper px-3 py-3">
          <div className="h-1.5 w-full rounded-full bg-paper-raised" />
          <div className="h-1.5 w-4/5 rounded-full bg-paper-raised" />
          <div className="h-1.5 w-3/5 rounded-full bg-paper-raised" />
        </div>
      </div>
    );
  }

  if (id === "classic") {
    return (
      <div className="rounded-lg border border-line px-3 py-3">
        <div className="h-1.5 w-1/2 rounded-full bg-ink/70" />
        <div className="mt-2 h-[3px] w-full" style={{ backgroundColor: color }} />
        <div className="mt-3 space-y-1.5 rounded border border-line p-2">
          <div className="h-1.5 w-full rounded-full bg-paper-raised" />
          <div className="h-1.5 w-4/5 rounded-full bg-paper-raised" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line px-3 py-3">
      <div className="h-1.5 w-1/3 rounded-full bg-ink/70" />
      <div className="mt-2 h-[2px] w-1/4" style={{ backgroundColor: color }} />
      <div className="mt-4 space-y-2">
        <div className="h-1.5 w-full rounded-full bg-paper-raised" />
        <div className="h-1.5 w-4/5 rounded-full bg-paper-raised" />
        <div className="h-1.5 w-3/5 rounded-full bg-paper-raised" />
      </div>
    </div>
  );
}

export function TemplateGallery({
  brandingColor,
  value,
  onSelect,
}: {
  brandingColor: string;
  value?: TemplateId;
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template.id)}
          className={cn(
            "flex flex-col gap-3 rounded-xl border p-4 text-left shadow-sm transition-colors",
            value === template.id ? "border-accent ring-2 ring-accent/15" : "border-line hover:border-ink/30",
          )}
        >
          <TemplatePreview id={template.id} color={brandingColor} />
          <div>
            <p className="font-semibold tracking-tight text-ink">{template.name}</p>
            <p className="text-sm text-ink-faint">{template.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
