# CLAUDE.md — Astra Dashboard (astraswissapp)

## Cos'è questo repo

Questo è il repo della **dashboard** di Astra (app.astra.ch) — il prodotto
vero e proprio, dove i clienti gestiscono fatture (Rechnungen), offerte
(Offerten) e clienti (Kunden). Il sito marketing (astra.ch, homepage +
landing page prodotto) è un **repo separato** (astraswiss) — non va
toccato/duplicato qui.

## Stato attuale: nessun backend reale

**Non c'è database né autenticazione in questa fase.** Tutti i dati
(profilo azienda, clienti, fatture, offerte) vivono nel `localStorage` del
browser, dietro il layer `src/lib/store/*` (funzioni tipo `getCompany()`,
`listClients()`, `createInvoice()`, ecc.). Questo è **deliberato**, non un
bug: l'app è single-tenant per browser, senza login/signup. Quando arriverà
un backend vero, l'idea è sostituire l'implementazione di `src/lib/store/*`
mantenendo le stesse funzioni/firme, senza riscrivere la UI.

Limitazioni note di questa fase (segnalate anche in `/einstellungen`):
- I dati sono legati al browser: pulire i dati del browser = perdere tutto.
  Nessun export/import ancora.
- Nessun multi-utente/login.
- `referenceType` sulle fatture supporta solo `"NON"` nella UI attuale (niente
  riferimento QR strutturato "QRR"): generare un riferimento QRR/SCOR valido
  richiede l'algoritmo di checksum Modulo 10 ricorsivo dello standard
  svizzero — non è stato implementato perché un checksum errato produce un
  QR-bill di pagamento non valido, e non c'era una fonte affidabile a portata
  di mano per verificarlo. Se serve, implementarlo con cura e verificarlo
  contro un validatore ufficiale prima di attivarlo in UI.

## Colore di branding: separazione dalla UI

Il colore scelto in onboarding (`company.brandingColor`) **non tocca mai la
UI della dashboard**, che resta nello stile Astra standard (bianco/nero/blu,
identico al design system di astraswiss — vedi sotto). Viene usato **solo**
dentro i PDF generati (Typst) come colore d'accento del documento
(intestazione/righe). Non introdurre codice che applichi
`company.brandingColor` a componenti React del prodotto.

## Design system

Stessa base di astraswiss: Next.js 16 + Tailwind v4 zero-config (token in
`src/app/globals.css` sotto `@theme inline`), font Inter + JetBrains Mono,
bottoni/input `rounded-lg`, card `rounded-xl`, badge `rounded-full`. Wordmark
"Astra" solo testo, nessun monogramma. Lingua UI: tedesco standard (Sie-Form).
`src/components/ui/` porta le stesse primitive (`Button`/`ButtonEl`, `Input`,
`Textarea`) più `Select`, `Badge`, `ColorPicker` aggiunti per la dashboard.

## Template fatture/offerte (Typst + QR-bill svizzero)

3 template (`minimal`, `classic`, `bold`) in `src/typst/templates/`,
condividono `_shared/layout.typ` (un'unica funzione `document-layout`,
parametrizzata da `variant` e da `include-payment-section: bool` — le
offerte passano `false` e quindi non mostrano la sezione QR-bill).

Il pacchetto Typst `@preview/payqr-swiss:0.4.1` (QR-bill svizzero) e la sua
dipendenza `@preview/tiaoma:0.3.0` (generatore QR/barcode via plugin WASM)
sono **vendorizzati** in `src/typst/packages/preview/` — file scaricati dal
mirror ufficiale `github.com/typst/packages` (non da `packages.typst.org`,
irraggiungibile da questo ambiente per policy di rete). **Non cancellare
questa cartella** e non sostituirla con un fetch a runtime: la route PDF
(`src/lib/typst-compile.ts`) copia questi file in una cache locale
(`$XDG_CACHE_HOME/typst/packages/...`) a ogni cold start proprio per evitare
una dipendenza di rete a runtime. Se in futuro serve aggiornare uno di questi
pacchetti, riscaricare i file dal mirror `typst/packages` sul commit/tag
corrispondente e sostituire la cartella vendorizzata.

Compilazione PDF: `@myriaddreamin/typst-ts-node-compiler` (native addon,
`export const runtime = "nodejs"` nelle route, mai Edge). Verificato con
build reale + chiamata HTTP end-to-end (vedi cronologia commit).

**Font vendorizzati** in `src/typst/fonts/<family>/` (Inter, Source Serif 4,
Space Grotesk — tutti OFL, scaricati dal mirror `google/fonts` su
`raw.githubusercontent.com`) e passati esplicitamente a `NodeCompiler.create`
via `fontArgs: [{ fontPaths: [...] }]` in `src/lib/typst-compile.ts`. Non
affidarsi a font di sistema (`set text(font: "...")` senza vendoring): in
questo sandbox capita che siano installati per caso, ma non è garantito
sull'ambiente di deploy. Ogni template ha un font "display" diverso
(minimal→Inter, classic→Source Serif 4, bold→Space Grotesk) per dargli
un'identità visiva distinta; il corpo/tabella resta sempre in Inter per
leggibilità. La sezione QR-bill sceglie il proprio font conforme SIX in
autonomia (`font: "auto"` di payqr-swiss) — non toccarla.

## Agente AI in chat

`src/lib/chat/` — tool-calling reale (non solo informativo) su Kunden/
Rechnungen/Offerten, modello **claude-haiku-4-5-20251001** (scelta esplicita
dell'utente per costo/velocità, da rivalutare se serve più ragionamento).
Richiede `ANTHROPIC_API_KEY` in env (vedi `.env.example`). Il loop
tool-calling gira **lato client** (`use-chat-agent.ts`): il server
(`/api/chat`) è solo un pass-through stateless verso Claude, perché i dati
vivono nel browser, non su un DB server-side. `execute-tool.ts` mappa 1:1 i
tool sulle funzioni di `src/lib/store/*` — non aggiungere un tool generico
"esegui funzione arbitraria".

## Note tecniche

- Next.js 16.2.10 / React 19.2.4, stesse versioni di astraswiss.
- Nessun shadcn/ui, stesse ragioni del repo sorella.
- Vedi anche `AGENTS.md` per l'avviso sulle breaking change di questa
  versione di Next.js: verificare sempre `node_modules/next/dist/docs/`
  prima di assumere una API.
