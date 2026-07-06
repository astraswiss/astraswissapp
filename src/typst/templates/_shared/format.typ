#let format-chf(amount) = {
  let precision = 2
  let s = str(calc.round(amount, digits: precision))
  let parts = s.split(".")
  let whole = parts.at(0)
  let fraction = if parts.len() > 1 { parts.at(1) } else { "" }
  if fraction.len() < precision {
    fraction += "0" * (precision - fraction.len())
  }
  let result = ""
  let len = whole.len()
  for i in range(len) {
    if i > 0 and calc.rem(len - i, 3) == 0 {
      result += "'"
    }
    result += whole.at(i)
  }
  "CHF " + result + "." + fraction
}

#let format-date(iso) = {
  let parts = iso.split("-")
  if parts.len() == 3 {
    parts.at(2) + "." + parts.at(1) + "." + parts.at(0)
  } else {
    iso
  }
}
