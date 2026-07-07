# PROGRESS.md — astraswissapp (Dashboard)

> Leggi questo file all'inizio di ogni sessione, prima di toccare codice.
> Va aggiornato quasi ad ogni sessione di lavoro: cosa fatto, cosa a metà,
> prossimo passo, idee per dopo. Vedi anche `CLAUDE.md` per contesto di
> prodotto/scope e `AGENTS.md` per l'avviso su Next.js 16.

## Stato attuale (2026-07-07)

- **Branch**: `claude/astraswissapp-dashboard-0nus5p`
- **Committato e pushato** (commit `b3f91df`, 2026-07-07): tutto il lavoro
  descritto sotto è su `origin/claude/astraswissapp-dashboard-0nus5p`. La
  cartella `avena/` resta volutamente non tracciata (solo riferimento
  locale, esclusa da `tsconfig.json`/`eslint.config.mjs`).
- `npm install` fatto, `.env.local` presente (serve `ANTHROPIC_API_KEY` per la
  chat AI, altrimenti quella funzione non risponde ma il resto dell'app
  funziona lo stesso).
- **⚠️ Nota sicurezza**: durante il commit, `.env.example` conteneva per
  errore una chiave API Anthropic reale (non il placeholder vuoto) — è stata
  ripristinata a vuoto PRIMA di committare, quindi non è mai entrata nella
  cronologia git. Controllare sempre `git diff .env.example` prima di
  committare, per sicurezza.

## Cosa è stato fatto in questa sessione

### 1. Ristruttura dashboard: "servizio" con sotto-navigazione + pannello AI
- Sidebar ridotta a 2 voci: **"Rechnungen & Offerten"** (copre Rechnungen/
  Offerten/Kunden) + **Einstellungen** (separata, trasversale).
  `src/components/layout/sidebar.tsx`.
- `rechnungen/`, `offerten/`, `kunden/` spostati in un route group
  `src/app/(dashboard)/(service)/` con un `layout.tsx` proprio: tab interne
  (Rechnungen | Offerten | Kunden, `service-nav.tsx`) sopra una griglia
  **3/5 contenuto + 2/5 pannello AI**.
- Scroll bloccato a livello di shell (`app-shell.tsx`: `h-screen
  overflow-hidden`, `main` è l'unico che scrolla) — mai più scroll di tutta
  la pagina, solo del contenuto.
- Tutte le pagine (liste E form `neu`/`[id]`) riempiono la colonna, niente
  più `mx-auto max-w-*` (eccetto `kunden/[id]` che non è stato toccato,
  nessuno l'ha chiesto).

### 2. Pannello AI: chat persistente + "AI surface" styling
- `src/components/chat/chat-dock.tsx` sostituisce il vecchio widget
  flottante globale (`chat-widget.tsx`, cancellato). Monta una volta sola nel
  layout del servizio → la cronologia chat sopravvive alla navigazione tra
  pagine, si resetta solo con un reload completo.
- Stile "AI" deliberatamente diverso dalle card prodotto normali: bordo ad
  anello sfumato, glow, sparkle ✨. Riservato SOLO a questo pannello — mai
  applicato a card Rechnungen/Offerten/Kunden normali (restano piatte, come
  da regola sul branding color).

### 3. Live preview del documento (non un iframe PDF!)
- `src/lib/chat/document-preview-context.tsx`: context che tiene "quale
  documento sto visualizzando in anteprima".
- `document-form.tsx`: mentre editi una Rechnung/Offerte, ogni modifica
  (debounce 150ms) ricostruisce un documento bozza e lo manda al context.
  **Parte già all'ingresso nella pagina** (cliente placeholder finché non ne
  scegli uno reale) e **torna alla chat quando esci** dalla pagina (effetto
  di cleanup su unmount).
- `src/components/documents/live-preview.tsx`: mock HTML/Tailwind che
  ricalca i 3 template Typst — **non** un iframe del PDF vero (rifiutato
  esplicitamente: "non mi piace come se fosse una pagina pdf"). Nessuna
  chiamata di rete, aggiornamento quasi istantaneo.
  **⚠️ REGOLA CRITICA**: questo file va tenuto sincronizzato a mano con
  `_shared/layout.typ`. Una volta si è disallineato (la preview mostrava il
  vecchio design colorato mentre il PDF vero era già stato riscritto in
  stile avena) e l'utente l'ha notato subito. Quando cambi un template in
  `layout.typ`, cambia SEMPRE anche il corrispondente componente in
  `live-preview.tsx` nella stessa sessione.

### 4. Template PDF: copiati 1:1 da avena
- L'utente ha un secondo progetto, **avena** (fatturazione KMU svizzere),
  clonato dentro `astraswissapp/avena/` **solo come riferimento di design**
  (repo separato, escluso da `tsconfig.json`/`eslint.config.mjs` — vedi
  sezione sotto).
- `src/typst/templates/_shared/layout.typ` riscritto da zero: `minimal` =
  avena `layout-1` (Swiss International/hairline), `classic` = avena
  `layout-2` (Briefkopf a tinta piena + tabella zebrata), `bold` = avena
  `layout-3` (editoriale, spazio bianco, titolo/totale enormi isolati).
  Copia fedele della struttura/spaziatura, adattata solo per: schema dati
  (company/client/document annidato vs. mittente/cliente/fattura flat di
  avena), IVA per riga (`vatRate` per line item) invece di un'unica
  `mwst_satz`, e uso di `company.brandingColor` come colore accento (avena
  usa nero fisso — divergenza voluta, non un errore: il CLAUDE.md di
  astraswissapp dice esplicitamente che il branding color va nei PDF).
- QR-bill (`payment-section`) invariata byte-per-byte rispetto a prima —
  non aggiungere `reference`/`additional-info` "per completezza" senza
  riverificare con un'app bancaria reale prima (vedi nota sotto su QRR).
- **Verificato**: compilazione reale via API per tutte le combinazioni
  Rechnung/Offerte × minimal/classic/bold, e confronto testo (`pdftotext`)
  per conferma che i 3 layout sono davvero distinti (non un bug di
  dispatch — l'utente aveva il sospetto ma era la live preview disallineata,
  vedi punto 3).

### 5. Altro
- `src/app/seed/page.tsx`: pagina temporanea (pulsante "Testdaten anlegen")
  che popola dati di esempio via le funzioni reali dello store (azienda
  Kohler Elektro AG, 4 clienti, 4 Rechnungen, 3 Offerten). Non idempotente —
  un solo click. Utile per demo/test visivi.
- `PdfDownloadButton` ("PDF öffnen"): ora apre il PDF in una **nuova scheda**
  (`window.open`) invece di un `<a download>` nascosto — in alcuni ambienti
  webview quell'attributo non veniva rispettato e navigava via l'intera SPA
  (chat compresa) verso il PDF.

## Problemi noti / da verificare (idee per dopo)

- **`PdfDownloadButton` in `document-form.tsx` usa `existingDoc` (stale)**,
  non lo stato corrente del form (`common`). Se cambi un campo (es. la
  Vorlage) e clicchi "PDF öffnen" PRIMA di "Speichern", scarichi il PDF con
  i dati/variante VECCHI. Non ancora sistemato — probabile causa di
  confusione se capita di nuovo un "il PDF non riflette quello che vedo".
  Fix: passare al bottone un documento costruito dallo stato live (come fa
  già l'effetto della live preview) invece di `existingDoc`.
- Nessun commit ancora fatto per tutto questo lavoro (vedi sopra).
- `kunden/[id]/page.tsx` è rimasta con `max-w-lg` (non allargata come le
  altre) — nessuno l'ha richiesto esplicitamente, ma è un'inconsistenza
  visibile se la si nota.
- QRR/SCOR (riferimento strutturato svizzero) resta non implementato in UI
  (solo "NON") — richiede l'algoritmo di checksum Modulo 10 ricorsivo,
  verificato con cura prima di attivarlo (vedi CLAUDE.md).

## Prossimo passo

Committato e pushato (vedi sopra). Da decidere insieme domani. Candidati:
(a) sistemare il bug del PdfDownloadButton stale, (b) continuare a
raffinare/testare visivamente i 3 template nel browser (finora verificato
solo via API + confronto testo, mai aperto in un browser vero).
