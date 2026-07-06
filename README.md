# Astra — Dashboard (astraswissapp)

Dashboard prodotto di Astra (app.astra.ch): Rechnungen, Offerten, Kunden.
Vedi `CLAUDE.md` per contesto di prodotto, scope e limitazioni note.

## Sviluppo

```bash
npm install
cp .env.example .env.local  # aggiungi ANTHROPIC_API_KEY per l'agente in chat
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) — al primo accesso
porta all'onboarding (dati azienda + colore di branding).

## Build

```bash
npm run build
npm run lint
```

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4. Nessun database o
autenticazione in questa fase: i dati vivono nel `localStorage` del
browser (vedi `src/lib/store/`). PDF di Rechnungen/Offerte generati con
Typst (QR-bill svizzero incluso) tramite
`@myriaddreamin/typst-ts-node-compiler`. Agente AI in chat con
tool-calling reale su Claude (`@anthropic-ai/sdk`).
