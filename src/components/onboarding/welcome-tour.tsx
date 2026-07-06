"use client";

import { useState } from "react";
import { ButtonEl } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slide = { title: string; body: string };

const SLIDES: Slide[] = [
  {
    title: "Rechnungen mit Schweizer QR-Rechnung",
    body: "Erstellen Sie Rechnungen mit integrierter QR-Rechnung als PDF — in wenigen Klicks.",
  },
  {
    title: "Offerten im selben Design",
    body: "Offerten nutzen dieselben Vorlagen wie Ihre Rechnungen — nur ohne Zahlteil.",
  },
  {
    title: "Kunden einmal erfassen",
    body: "Erfassen Sie Kunden einmal und wählen Sie sie bei jeder Rechnung oder Offerte wieder aus.",
  },
  {
    title: "Fragen Sie den Assistenten",
    body: "Der Chat-Assistent unten rechts kann Kunden, Rechnungen und Offerten direkt für Sie anlegen.",
  },
];

function InvoiceMockup({ color, withPayment }: { color: string; withPayment: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="px-3 py-2.5" style={{ backgroundColor: color }}>
        <div className="h-1.5 w-1/3 rounded-full bg-white/70" />
      </div>
      <div className="space-y-1.5 px-3 py-3">
        <div className="h-1.5 w-full rounded-full bg-paper-raised" />
        <div className="h-1.5 w-4/5 rounded-full bg-paper-raised" />
        <div className="h-1.5 w-3/5 rounded-full bg-paper-raised" />
      </div>
      {withPayment && (
        <div className="flex items-center justify-end gap-2 border-t border-line px-3 py-2">
          <div className="h-6 w-6 rounded bg-paper-raised" />
          <div className="h-1.5 w-10 rounded-full bg-paper-raised" />
        </div>
      )}
    </div>
  );
}

function ClientListMockup() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
          <div className="h-7 w-7 shrink-0 rounded-full bg-paper-raised" />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-2/5 rounded-full bg-paper-raised" />
            <div className="h-1.5 w-3/5 rounded-full bg-paper-raised" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
      <div className="max-w-[75%] rounded-xl bg-paper-raised px-3 py-2 text-xs text-ink-soft">
        Erstelle einen Kunden Müller Sanitär GmbH.
      </div>
      <div className="ml-auto max-w-[75%] rounded-xl bg-accent px-3 py-2 text-xs text-white">
        Erledigt — Kunde angelegt.
      </div>
    </div>
  );
}

export function WelcomeTour({
  brandingColor,
  onFinish,
}: {
  brandingColor: string;
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-line p-6 shadow-sm sm:p-8">
        {index === 0 && <InvoiceMockup color={brandingColor} withPayment />}
        {index === 1 && <InvoiceMockup color={brandingColor} withPayment={false} />}
        {index === 2 && <ClientListMockup />}
        {index === 3 && <ChatMockup />}
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-ink">{slide.title}</h2>
        <p className="mt-2 text-ink-soft">{slide.body}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              className={cn("h-1.5 w-1.5 rounded-full", i === index ? "bg-accent" : "bg-line")}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onFinish} className="text-sm text-ink-faint hover:text-ink">
            Überspringen
          </button>
          {index > 0 && (
            <ButtonEl type="button" variant="secondary" onClick={() => setIndex((i) => i - 1)}>
              Zurück
            </ButtonEl>
          )}
          <ButtonEl type="button" onClick={() => (isLast ? onFinish() : setIndex((i) => i + 1))}>
            {isLast ? "Los geht's" : "Weiter"}
          </ButtonEl>
        </div>
      </div>
    </div>
  );
}
