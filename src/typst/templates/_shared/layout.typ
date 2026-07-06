#import "@preview/payqr-swiss:0.4.1": swiss-qr-bill
#import "format.typ": format-chf, format-date

// One shared "body" font everywhere (table, addresses, labels) for
// legibility; each variant additionally gets its own "display" font used
// only for headlines/titles/amounts, so the 3 templates read as genuinely
// different documents rather than the same layout in 3 colors.
#let body-font = "Inter"
#let display-fonts = (
  minimal: "Inter",
  classic: "Source Serif 4",
  bold: "Space Grotesk",
)

#let full-address(addr) = {
  addr.street + " " + addr.houseNumber + ", " + addr.postalCode + " " + addr.city
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

#let line-items-table(line-items, amount-font: none) = {
  let amount-text(body) = if amount-font != none { text(font: amount-font)[#body] } else { [#body] }

  table(
    columns: (1fr, auto, auto, auto, auto),
    stroke: (x, y) => if y == 0 { (bottom: 0.75pt + black) } else { (bottom: 0.5pt + rgb("#e5e7eb")) },
    inset: (x: 6pt, y: 8pt),
    align: (left, right, right, right, right),
    table.header(
      text(size: 8pt, weight: "medium", tracking: 0.3pt)[BESCHREIBUNG],
      text(size: 8pt, weight: "medium", tracking: 0.3pt)[MENGE],
      text(size: 8pt, weight: "medium", tracking: 0.3pt)[PREIS],
      text(size: 8pt, weight: "medium", tracking: 0.3pt)[MWST],
      text(size: 8pt, weight: "medium", tracking: 0.3pt)[TOTAL],
    ),
    ..line-items.map(item => (
      text(size: 9.5pt)[#item.description],
      text(size: 9.5pt)[#item.quantity],
      amount-text(text(size: 9.5pt)[#format-chf(item.unitPrice)]),
      text(size: 9.5pt, fill: rgb("#8b8f99"))[#item.vatRate %],
      amount-text(text(size: 9.5pt, weight: "medium")[#format-chf(item.quantity * item.unitPrice)]),
    )).flatten()
  )
}

#let subtotal-rows(line-items) = {
  let subtotal = line-items.map(item => item.quantity * item.unitPrice).sum(default: 0)
  let breakdown = vat-breakdown(line-items)
  let vat-total = breakdown.map(entry => entry.amount).sum(default: 0)
  (subtotal: subtotal, breakdown: breakdown, vat-total: vat-total, total: subtotal + vat-total)
}

// --- minimal: soft accent-tinted total card ---
#let totals-minimal(accent, line-items) = {
  let sums = subtotal-rows(line-items)
  align(right)[
    #block(width: 62%)[
      #grid(
        columns: (1fr, auto),
        row-gutter: 5pt,
        column-gutter: 10pt,
        text(size: 9pt, fill: rgb("#565b66"))[Zwischensumme], text(size: 9pt)[#format-chf(sums.subtotal)],
        ..sums.breakdown.map(entry => (
          text(size: 9pt, fill: rgb("#565b66"))[MWST #entry.rate %], text(size: 9pt)[#format-chf(entry.amount)],
        )).flatten(),
      )
      #v(10pt)
      #block(width: 100%, fill: accent.lighten(88%), radius: 8pt, inset: (x: 14pt, y: 11pt))[
        #grid(
          columns: (1fr, auto),
          column-gutter: 10pt,
          align: horizon,
          text(size: 10pt, weight: "medium")[Total],
          text(size: 16pt, weight: "bold", fill: accent.darken(10%))[#format-chf(sums.total)],
        )
      ]
    ]
  ]
}

// --- classic: bordered ledger box, serif total ---
#let totals-classic(accent, line-items) = {
  let sums = subtotal-rows(line-items)
  align(right)[
    #block(width: 62%, stroke: 0.75pt + rgb("#e5e7eb"), radius: 3pt, inset: (x: 14pt, y: 12pt))[
      #grid(
        columns: (1fr, auto),
        row-gutter: 5pt,
        column-gutter: 10pt,
        text(size: 9pt, fill: rgb("#565b66"))[Zwischensumme], text(size: 9pt)[#format-chf(sums.subtotal)],
        ..sums.breakdown.map(entry => (
          text(size: 9pt, fill: rgb("#565b66"))[MWST #entry.rate %], text(size: 9pt)[#format-chf(entry.amount)],
        )).flatten(),
      )
      #v(6pt)
      #line(length: 100%, stroke: 0.75pt + accent)
      #v(8pt)
      #grid(
        columns: (1fr, auto),
        column-gutter: 10pt,
        align: horizon,
        text(size: 10pt, weight: "medium")[Total],
        text(font: "Source Serif 4", size: 17pt, weight: "bold")[#format-chf(sums.total)],
      )
    ]
  ]
}

// --- bold: big stat callout ---
#let totals-bold(accent, line-items) = {
  let sums = subtotal-rows(line-items)
  align(right)[
    #block(width: 62%)[
      #grid(
        columns: (1fr, auto),
        row-gutter: 5pt,
        column-gutter: 10pt,
        text(size: 9pt, fill: rgb("#565b66"))[Zwischensumme], text(size: 9pt, font: "Space Grotesk")[#format-chf(sums.subtotal)],
        ..sums.breakdown.map(entry => (
          text(size: 9pt, fill: rgb("#565b66"))[MWST #entry.rate %], text(size: 9pt, font: "Space Grotesk")[#format-chf(entry.amount)],
        )).flatten(),
      )
      #v(10pt)
      #block(width: 100%, fill: accent.lighten(85%), radius: 4pt, inset: (x: 16pt, y: 13pt))[
        #text(size: 9pt, weight: "medium", tracking: 0.5pt, fill: accent.darken(15%))[TOTAL]
        #v(2pt)
        #text(font: "Space Grotesk", size: 22pt, weight: "bold")[#format-chf(sums.total)]
      ]
    ]
  ]
}

#let header-minimal(accent, company, title, number) = [
  #text(size: 12pt, weight: "medium")[#company.name]
  #v(14pt)
  #line(length: 22%, stroke: 1.5pt + accent)
  #v(10pt)
  #text(size: 9pt, weight: "medium", tracking: 1.2pt, fill: accent)[#upper(title)]
  #v(2pt)
  #text(size: 22pt, weight: "bold")[#number]
]

#let header-classic(accent, company, title, number) = [
  #text(font: "Source Serif 4", size: 16pt, weight: "bold")[#company.name]
  #v(3pt)
  #text(size: 8.5pt, fill: rgb("#565b66"))[#full-address(company.address)]
  #v(9pt)
  #line(length: 100%, stroke: 0.5pt + accent)
  #v(1.5pt)
  #line(length: 100%, stroke: 2pt + accent)
  #v(10pt)
  #text(font: "Source Serif 4", size: 15pt, weight: "bold")[#title] #text(size: 11pt, fill: rgb("#565b66"))[#number]
]

#let header-bold(accent, company, title, number) = [
  #block(width: 100%, fill: accent, inset: (x: 18pt, y: 18pt))[
    #text(font: "Space Grotesk", fill: white, size: 24pt, weight: "bold")[#title]
    #text(font: "Space Grotesk", fill: white.transparentize(25%), size: 24pt, weight: "bold")[ #number]
    #v(4pt)
    #text(fill: white.transparentize(15%), size: 10pt)[#company.name]
  ]
  #v(16pt)
]

#let document-layout(payload, variant: "minimal", include-payment-section: true) = {
  let document = payload.document
  let company = payload.company
  let client = payload.client
  let accent = rgb(company.brandingColor)
  let title = if document.kind == "invoice" { "Rechnung" } else { "Offerte" }

  set page(paper: "a4", margin: (x: 20mm, y: 18mm))
  set text(font: body-font, size: 10pt, lang: "de")

  if variant == "minimal" { header-minimal(accent, company, title, document.number) }
  else if variant == "classic" { header-classic(accent, company, title, document.number) }
  else { header-bold(accent, company, title, document.number) }

  v(10mm)

  grid(
    columns: (1fr, 1fr),
    [
      #text(size: 8pt, fill: rgb("#8b8f99"))[Rechnungsadresse]
      #v(2pt)
      #text(size: 9pt, weight: "medium")[#client.name] \
      #text(size: 9pt)[#full-address(client.address)]
    ],
    align(right)[
      #text(size: 8pt, fill: rgb("#8b8f99"))[Datum]
      #v(2pt)
      #text(size: 9pt)[#format-date(document.issueDate)]
      #if document.kind == "invoice" [
        #v(6pt)
        #text(size: 8pt, fill: rgb("#8b8f99"))[Fällig am]
        #v(2pt)
        #text(size: 9pt)[#format-date(document.dueDate)]
      ] else if document.at("validUntil", default: none) != none [
        #v(6pt)
        #text(size: 8pt, fill: rgb("#8b8f99"))[Gültig bis]
        #v(2pt)
        #text(size: 9pt)[#format-date(document.validUntil)]
      ]
    ],
  )

  v(12mm)
  line-items-table(document.lineItems, amount-font: if variant == "bold" { "Space Grotesk" } else { none })
  v(6mm)
  if variant == "minimal" { totals-minimal(accent, document.lineItems) }
  else if variant == "classic" { totals-classic(accent, document.lineItems) }
  else { totals-bold(accent, document.lineItems) }

  if document.at("note", default: none) != none {
    v(10mm)
    text(size: 9pt, fill: rgb("#565b66"))[#document.note]
  }

  if include-payment-section {
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
}
