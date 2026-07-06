#import "@preview/payqr-swiss:0.4.1": swiss-qr-bill
#import "format.typ": format-chf, format-date

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

#let line-items-table(line-items) = {
  table(
    columns: (1fr, auto, auto, auto, auto),
    stroke: (x, y) => if y == 0 { (bottom: 0.75pt + black) } else { (bottom: 0.5pt + rgb("#e5e7eb")) },
    inset: (x: 4pt, y: 6pt),
    align: (left, right, right, right, right),
    table.header(
      text(size: 8pt, weight: "medium")[Beschreibung],
      text(size: 8pt, weight: "medium")[Menge],
      text(size: 8pt, weight: "medium")[Preis],
      text(size: 8pt, weight: "medium")[MWST],
      text(size: 8pt, weight: "medium")[Total],
    ),
    ..line-items.map(item => (
      text(size: 9pt)[#item.description],
      text(size: 9pt)[#item.quantity],
      text(size: 9pt)[#format-chf(item.unitPrice)],
      text(size: 9pt)[#item.vatRate %],
      text(size: 9pt)[#format-chf(item.quantity * item.unitPrice)],
    )).flatten()
  )
}

#let totals-block(line-items) = {
  let subtotal = line-items.map(item => item.quantity * item.unitPrice).sum(default: 0)
  let breakdown = vat-breakdown(line-items)
  let vat-total = breakdown.map(entry => entry.amount).sum(default: 0)

  align(right)[
    #block(width: 55%)[
      #grid(
        columns: (1fr, auto),
        row-gutter: 4pt,
        column-gutter: 8pt,
        text(size: 9pt, fill: rgb("#565b66"))[Zwischensumme], text(size: 9pt)[#format-chf(subtotal)],
        ..breakdown.map(entry => (
          text(size: 9pt, fill: rgb("#565b66"))[MWST #entry.rate %], text(size: 9pt)[#format-chf(entry.amount)],
        )).flatten(),
      )
      #v(4pt)
      #line(length: 100%, stroke: 0.75pt + black)
      #v(4pt)
      #grid(
        columns: (1fr, auto),
        column-gutter: 8pt,
        text(size: 11pt, weight: "bold")[Total], text(size: 11pt, weight: "bold")[#format-chf(subtotal + vat-total)],
      )
    ]
  ]
}

#let header-minimal(accent, company, title, number) = [
  #text(size: 13pt, weight: "bold")[#company.name]
  #v(4pt)
  #line(length: 30%, stroke: 1.2pt + accent)
  #v(16pt)
  #text(size: 17pt, weight: "bold")[#title] #text(size: 17pt, fill: rgb("#8b8f99"))[#number]
]

#let header-classic(accent, company, title, number) = [
  #text(size: 13pt, weight: "bold")[#company.name]
  #v(2pt)
  #text(size: 8pt)[#full-address(company.address)]
  #v(8pt)
  #line(length: 100%, stroke: 1.5pt + accent)
  #v(10pt)
  #text(size: 15pt, weight: "bold")[#title #number]
]

#let header-bold(accent, company, title, number) = [
  #block(width: 100%, fill: accent, inset: 16pt)[
    #text(fill: white, size: 16pt, weight: "bold")[#company.name]
    #v(4pt)
    #text(fill: white, size: 11pt)[#title #number]
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
  set text(font: "Liberation Sans", size: 10pt, lang: "de")

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
  line-items-table(document.lineItems)
  v(6mm)
  totals-block(document.lineItems)

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
