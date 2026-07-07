#import "@preview/payqr-swiss:0.4.1": swiss-qr-bill
#import "format.typ": format-chf, format-date

// The 3 variants below are ports of the 3 hand-designed layouts from the
// sister project "avena" (avena/templates/layout-{1,2,3}.typ) — minimal ==
// avena layout-1 (Swiss International/hairline), classic == avena layout-2
// (solid Briefkopf + zebra table), bold == avena layout-3 (editorial/huge
// whitespace). Ported 1:1 in structure and spacing; adapted only where the
// data shape differs (this app's nested company/client/document vs. avena's
// flat mittente/cliente/fattura, per-line-item vatRate vs. a single
// mwst_satz) and where product spec differs: this app's PDFs use
// `company.brandingColor` as the accent (avena deliberately keeps black —
// see astraswissapp's CLAUDE.md, this is intentional, not an oversight).

#let compact-address(addr) = addr.street + " " + addr.houseNumber + " · " + addr.postalCode + " " + addr.city

#let qty(n) = {
  if calc.abs(n - calc.round(n)) < 0.001 { str(calc.round(n)) }
  else { str(calc.round(n, digits: 2)) }
}

#let vat-breakdown(line-items) = {
  let rates = ()
  for item in line-items {
    if not rates.contains(item.vatRate) {
      rates += (item.vatRate,)
    }
  }
  rates = rates.sorted()
  rates.map(rate => {
    let base = line-items
      .filter(item => item.vatRate == rate)
      .map(item => item.quantity * item.unitPrice)
      .sum(default: 0)
    (rate: rate, base: base, amount: base * rate / 100)
  })
}

#let subtotal-rows(line-items) = {
  let subtotal = line-items.map(item => item.quantity * item.unitPrice).sum(default: 0)
  let breakdown = vat-breakdown(line-items)
  let vat-total = breakdown.map(entry => entry.amount).sum(default: 0)
  (subtotal: subtotal, breakdown: breakdown, vat-total: vat-total, total: subtotal + vat-total)
}

// The Total is the one thing the recipient must act on, so we pair it with
// the due date right at the anchor point instead of leaving the reader to
// scroll back up to the meta block.
#let due-reminder(document) = {
  if document.kind == "invoice" {
    "fällig am " + format-date(document.dueDate)
  } else if document.at("validUntil", default: none) != none {
    "gültig bis " + format-date(document.validUntil)
  } else { none }
}

#let payment-section(payload) = {
  let document = payload.document
  let company = payload.company
  let client = payload.client
  v(1fr)
  pagebreak(weak: true)
  swiss-qr-bill(
    account: company.iban,
    creditor-name: company.name,
    creditor-street: company.address.street,
    creditor-building: company.address.houseNumber,
    creditor-postal-code: company.address.postalCode,
    creditor-city: company.address.city,
    creditor-country: company.address.country,
    amount: document.lineItems.map(item => item.quantity * item.unitPrice * (1 + item.vatRate / 100)).sum(default: 0),
    currency: document.currency,
    debtor-name: client.name,
    debtor-street: client.address.street,
    debtor-building: client.address.houseNumber,
    debtor-postal-code: client.address.postalCode,
    debtor-city: client.address.city,
    debtor-country: client.address.country,
    reference-type: document.referenceType,
    language: "de",
    standalone: true,
  )
}

// === Variant 1 — "minimal" (avena layout-1: Swiss International Style) ===
// Rigid grid, lots of white, one accent color, hairlines instead of filled
// boxes — optimized for fast payment: the Total is the strongest element on
// the page after the title.
#let render-minimal(payload, include-payment-section: true) = {
  let document = payload.document
  let company = payload.company
  let client = payload.client
  let accent = rgb(company.brandingColor)
  let is-offer = document.kind == "offer"
  let title = if is-offer { "OFFERTE" } else { "RECHNUNG" }
  let muted = rgb("#6b7280")
  let hairline = rgb("#dfe3e8")

  set page(paper: "a4", margin: (left: 20mm, right: 20mm, top: 22mm, bottom: 18mm))
  set text(font: "Inter", size: 10pt, fill: rgb("#1a1d24"), lang: "de", region: "CH")

  // Mittente (letterhead — also the reference for a window envelope)
  text(size: 8pt, fill: muted)[
    #strong(company.name) · #compact-address(company.address)
  ]
  v(3mm)
  line(length: 100%, stroke: 0.6pt + hairline)
  v(14mm)

  // Empfänger
  block(width: 85mm)[
    #set par(leading: 0.6em)
    #client.name \
    #client.address.street #client.address.houseNumber \
    #client.address.postalCode #client.address.city
  ]
  v(16mm)

  // Titel + Ort, Datum
  grid(
    columns: (1fr, auto),
    align: (left + bottom, right + bottom),
    text(size: 24pt, weight: "bold", fill: accent)[#title],
    text(size: 9pt, fill: muted)[#company.address.city, #format-date(document.issueDate)],
  )
  v(3mm)
  line(length: 100%, stroke: 1.2pt + accent)
  v(7mm)

  // Meta-Streifen (Nummer, Datum, Frist) — Linien statt gefüllter Box
  let deadline = if is-offer { document.at("validUntil", default: none) } else { document.dueDate }
  let meta-items = (
    (label: if is-offer { "Offerte-Nr." } else { "Rechnungs-Nr." }, value: document.number),
    (label: "Datum", value: format-date(document.issueDate)),
  )
  let meta-items = if deadline != none {
    meta-items + ((label: if is-offer { "Gültig bis" } else { "Zahlbar bis" }, value: format-date(deadline)),)
  } else { meta-items }

  block(width: 100%, stroke: (top: 0.6pt + hairline, bottom: 0.6pt + hairline), inset: (y: 8pt))[
    #grid(
      columns: meta-items.map(_ => auto),
      column-gutter: 16mm,
      ..meta-items.map(mi => [
        #text(size: 7.5pt, fill: muted)[#upper(mi.label)] \
        #text(size: 11pt, weight: "medium")[#mi.value]
      ])
    )
  ]
  v(8mm)

  // Tabelle — Header unterstrichen, Zeilen durch Haarlinien getrennt
  table(
    columns: (1fr, auto, auto, auto),
    align: (left, right, right, right),
    stroke: (top: none, x: none, bottom: 0.4pt + hairline),
    inset: (x: 6pt, y: 9pt),
    table.hline(stroke: 1.2pt + accent),
    table.header(
      text(fill: accent, weight: "bold", size: 9pt)[Beschreibung],
      text(fill: accent, weight: "bold", size: 9pt)[Menge],
      text(fill: accent, weight: "bold", size: 9pt)[Preis],
      text(fill: accent, weight: "bold", size: 9pt)[Betrag],
    ),
    table.hline(stroke: 1.2pt + accent),
    ..document.lineItems.map(item => (
      [#item.description], [#qty(item.quantity)], [#format-chf(item.unitPrice)], [#format-chf(item.quantity * item.unitPrice)],
    )).flatten(),
  )
  v(8mm)

  // Total — die visuelle Ankerstelle der Seite
  let sums = subtotal-rows(document.lineItems)
  let reminder = due-reminder(document)

  align(right)[
    #block(width: 72mm)[
      #grid(
        columns: (1fr, auto),
        row-gutter: 7pt,
        align: (left, right),
        text(fill: muted, size: 9pt)[Zwischensumme], text(size: 10pt)[#format-chf(sums.subtotal)],
        ..sums.breakdown.map(entry => (
          text(fill: muted, size: 9pt)[MWST #entry.rate%], text(size: 10pt)[#format-chf(entry.amount)],
        )).flatten(),
      )
      #v(4mm)
      #block(fill: accent, inset: (x: 10pt, y: 9pt), width: 100%)[
        #grid(
          columns: (1fr, auto),
          align: (left + horizon, right + horizon),
          [
            #text(fill: white, weight: "bold", size: 11pt)[Total]
            #if reminder != none [
              #linebreak()
              #text(fill: rgb("#b3b3b3"), size: 7.5pt)[#reminder]
            ]
          ],
          text(fill: white, weight: "bold", size: 15pt)[#format-chf(sums.total)],
        )
      ]
      #if not is-offer [
        #v(3mm)
        #align(right)[
          #text(size: 7.5pt, fill: muted, style: "italic")[Zahlbar mit beiliegendem Einzahlungsschein — Seite 2]
        ]
      ]
    ]
  ]

  if document.at("note", default: none) != none {
    v(8mm)
    line(length: 100%, stroke: 0.4pt + hairline)
    v(3mm)
    text(size: 8.5pt, fill: muted)[#document.note]
  }

  if include-payment-section and not is-offer { payment-section(payload) }
}

// === Variant 2 — "classic" (avena layout-2: klassisch, farbiger Briefkopf) ===
// Studio-Briefkopf auf Volltonfarbe, weiche runde Boxen und Flächen statt
// Haarlinien, Tabelle mit Volltonheader und Zebra-Zeilen.
#let render-classic(payload, include-payment-section: true) = {
  let document = payload.document
  let company = payload.company
  let client = payload.client
  let accent = rgb(company.brandingColor)
  let accent-tint-soft = accent.lighten(94%)
  let is-offer = document.kind == "offer"
  let title = if is-offer { "OFFERTE" } else { "RECHNUNG" }
  let muted = rgb("#6b7280")
  let hairline = rgb("#dfe3e8")

  set page(paper: "a4", margin: (left: 20mm, right: 20mm, top: 15mm, bottom: 18mm))
  set text(font: "Source Serif 4", size: 10pt, fill: rgb("#1a1d24"), lang: "de", region: "CH")

  // Briefkopf
  block(width: 100%, fill: accent, radius: 3pt, inset: (x: 14pt, y: 12pt))[
    #text(size: 15pt, weight: "bold", fill: white)[#company.name]
    #linebreak()
    #text(size: 8pt, fill: white.transparentize(25%))[#compact-address(company.address)]
  ]
  v(10mm)

  // Empfänger
  block(width: 85mm)[
    #set par(leading: 0.6em)
    #client.name \
    #client.address.street #client.address.houseNumber \
    #client.address.postalCode #client.address.city
  ]
  v(12mm)

  // Titel + Ort, Datum
  grid(
    columns: (1fr, auto),
    align: (left + bottom, right + bottom),
    text(size: 22pt, weight: "bold", fill: accent)[#title],
    text(size: 9pt, fill: muted)[#company.address.city, #format-date(document.issueDate)],
  )
  v(6mm)

  // Meta-Box — weiche Fläche statt Linien
  let deadline = if is-offer { document.at("validUntil", default: none) } else { document.dueDate }
  let meta-items = (
    (label: if is-offer { "Offerte-Nr." } else { "Rechnungs-Nr." }, value: document.number),
    (label: "Datum", value: format-date(document.issueDate)),
  )
  let meta-items = if deadline != none {
    meta-items + ((label: if is-offer { "Gültig bis" } else { "Zahlbar bis" }, value: format-date(deadline)),)
  } else { meta-items }

  block(width: 100%, fill: accent-tint-soft, radius: 3pt, inset: (x: 14pt, y: 9pt))[
    #grid(
      columns: meta-items.map(_ => auto),
      column-gutter: 16mm,
      ..meta-items.map(mi => [
        #text(size: 7.5pt, fill: accent)[#upper(mi.label)] \
        #text(size: 11pt, weight: "medium")[#mi.value]
      ])
    )
  ]
  v(8mm)

  // Tabelle — Volltonheader, Zebra-Zeilen
  table(
    columns: (1fr, auto, auto, auto),
    align: (left, right, right, right),
    stroke: none,
    inset: (x: 8pt, y: 8pt),
    fill: (x, y) => {
      if y == 0 { accent }
      else if calc.rem(y, 2) == 0 { accent-tint-soft }
      else { white }
    },
    table.header(
      text(fill: white, weight: "bold", size: 9pt)[Beschreibung],
      text(fill: white, weight: "bold", size: 9pt)[Menge],
      text(fill: white, weight: "bold", size: 9pt)[Preis],
      text(fill: white, weight: "bold", size: 9pt)[Betrag],
    ),
    ..document.lineItems.map(item => (
      [#item.description], [#qty(item.quantity)], [#format-chf(item.unitPrice)], [#format-chf(item.quantity * item.unitPrice)],
    )).flatten(),
  )
  v(8mm)

  // Total — Box mit vollem Rahmen, abgerundet
  let sums = subtotal-rows(document.lineItems)
  let reminder = due-reminder(document)

  align(right)[
    #block(width: 78mm, stroke: 0.8pt + accent, radius: 4pt, inset: (x: 12pt, y: 10pt))[
      #grid(
        columns: (1fr, auto),
        row-gutter: 7pt,
        align: (left, right),
        text(fill: muted, size: 9pt)[Zwischensumme], text(size: 10pt)[#format-chf(sums.subtotal)],
        ..sums.breakdown.map(entry => (
          text(fill: muted, size: 9pt)[MWST #entry.rate%], text(size: 10pt)[#format-chf(entry.amount)],
        )).flatten(),
      )
      #v(5mm)
      #block(fill: accent, radius: 3pt, inset: (x: 10pt, y: 9pt), width: 100%)[
        #grid(
          columns: (1fr, auto),
          align: (left + horizon, right + horizon),
          [
            #text(fill: white, weight: "bold", size: 11pt)[Total]
            #if reminder != none [
              #linebreak()
              #text(fill: rgb("#b8bcc2"), size: 7.5pt)[#reminder]
            ]
          ],
          text(fill: white, weight: "bold", size: 15pt)[#format-chf(sums.total)],
        )
      ]
    ]
    #if not is-offer [
      #v(3mm)
      #text(size: 7.5pt, fill: muted, style: "italic")[Zahlbar mit beiliegendem Einzahlungsschein — Seite 2]
    ]
  ]

  if document.at("note", default: none) != none {
    v(8mm)
    line(length: 100%, stroke: 0.4pt + hairline)
    v(3mm)
    text(size: 8.5pt, fill: muted)[#document.note]
  }

  if include-payment-section and not is-offer { payment-section(payload) }
}

// === Variant 3 — "bold" (avena layout-3: editorial/modern) ===
// Kein Briefkopf-Block: Mittente minimal oben rechts. Viel Weissraum statt
// Rahmen/Flächen zur Trennung. Titel und Total riesig und isoliert als
// visuelle Anker. Tabelle ohne Header-Fläche, nur eine Haarlinie darunter.
#let render-bold(payload, include-payment-section: true) = {
  let document = payload.document
  let company = payload.company
  let client = payload.client
  let accent = rgb(company.brandingColor)
  let is-offer = document.kind == "offer"
  let title = if is-offer { "Offerte" } else { "Rechnung" }
  let muted = rgb("#8a8f98")
  let hairline = rgb("#e8e9eb")

  set page(paper: "a4", margin: (left: 22mm, right: 22mm, top: 18mm, bottom: 18mm))
  set text(font: "Space Grotesk", size: 9.5pt, fill: rgb("#1a1d24"), lang: "de", region: "CH")

  // Mittente — minimal, oben rechts (kein Block/Band)
  align(right)[
    #text(size: 10pt, weight: "bold")[#company.name] \
    #text(size: 8pt, fill: muted)[#compact-address(company.address)]
  ]
  v(11mm)

  // Riesiger, isolierter Titel — die Ankerstelle der Seite
  text(size: 30pt, weight: "bold", tracking: -0.5pt)[#title]
  v(8mm)

  // Empfänger + Meta nebeneinander, nur durch Weissraum getrennt
  let deadline = if is-offer { document.at("validUntil", default: none) } else { document.dueDate }
  grid(
    columns: (1fr, 1fr),
    column-gutter: 12mm,
    [
      #text(size: 7.5pt, fill: muted)[#upper("Empfänger")]
      #v(2mm)
      #set par(leading: 0.6em)
      #text(size: 10pt)[#client.name] \
      #client.address.street #client.address.houseNumber \
      #client.address.postalCode #client.address.city
    ],
    [
      #text(size: 7.5pt, fill: muted)[#upper(if is-offer { "Offerte-Nr." } else { "Rechnungs-Nr." })]
      #v(2mm)
      #text(size: 10pt)[#document.number]
      #v(5mm)
      #text(size: 7.5pt, fill: muted)[#upper("Datum")]
      #v(2mm)
      #text(size: 10pt)[#format-date(document.issueDate)]
      #if deadline != none [
        #v(5mm)
        #text(size: 7.5pt, fill: muted)[#upper(if is-offer { "Gültig bis" } else { "Zahlbar bis" })]
        #v(2mm)
        #text(size: 10pt)[#format-date(deadline)]
      ]
    ],
  )
  v(9mm)

  // Tabelle — kein Rahmen, nur Abstand + eine Haarlinie darunter
  grid(
    columns: (1fr, auto, auto, auto),
    column-gutter: 8mm,
    row-gutter: 9pt,
    align: (left, right, right, right),
    text(size: 7.5pt, fill: muted)[#upper("Beschreibung")],
    text(size: 7.5pt, fill: muted)[#upper("Menge")],
    text(size: 7.5pt, fill: muted)[#upper("Preis")],
    text(size: 7.5pt, fill: muted)[#upper("Betrag")],
    ..document.lineItems.map(item => (
      [#item.description], [#qty(item.quantity)], [#format-chf(item.unitPrice)], [#format-chf(item.quantity * item.unitPrice)],
    )).flatten(),
  )
  v(4mm)
  line(length: 100%, stroke: 0.4pt + hairline)
  v(8mm)

  // Total — rechtsbündig, isoliert und gross
  let sums = subtotal-rows(document.lineItems)
  let reminder = due-reminder(document)

  align(right)[
    #block(width: 70mm)[
      #grid(
        columns: (1fr, auto),
        row-gutter: 7pt,
        align: (left, right),
        text(fill: muted, size: 9pt)[Zwischensumme], text(size: 9.5pt)[#format-chf(sums.subtotal)],
        ..sums.breakdown.map(entry => (
          text(fill: muted, size: 9pt)[MWST #entry.rate%], text(size: 9.5pt)[#format-chf(entry.amount)],
        )).flatten(),
      )
      #v(6mm)
      #line(length: 100%, stroke: 0.8pt + accent)
      #v(6mm)
      #grid(
        columns: (1fr, auto),
        align: (left + horizon, right + horizon),
        text(size: 11pt)[Total],
        text(weight: "bold", size: 20pt)[#format-chf(sums.total)],
      )
      #if reminder != none [
        #v(3mm)
        #align(right)[#text(size: 7.5pt, fill: muted)[#reminder]]
      ]
    ]
    #if not is-offer [
      #v(4mm)
      #text(size: 7.5pt, fill: muted, style: "italic")[Zahlbar mit beiliegendem Einzahlungsschein — Seite 2]
    ]
  ]

  if document.at("note", default: none) != none {
    v(6mm)
    line(length: 100%, stroke: 0.4pt + hairline)
    v(3mm)
    text(size: 8.5pt, fill: muted)[#document.note]
  }

  if include-payment-section and not is-offer { payment-section(payload) }
}

#let document-layout(payload, variant: "minimal", include-payment-section: true) = {
  if variant == "minimal" { render-minimal(payload, include-payment-section: include-payment-section) }
  else if variant == "classic" { render-classic(payload, include-payment-section: include-payment-section) }
  else { render-bold(payload, include-payment-section: include-payment-section) }
}
