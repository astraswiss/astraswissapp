const chfFormatter = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Swiss format: apostrophe thousands separator, e.g. "CHF 1'480.50". */
export function formatChf(amount: number): string {
  return `CHF ${chfFormatter.format(amount)}`;
}

const dateFormatter = new Intl.DateTimeFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Swiss format, e.g. "06.07.2026". Accepts an ISO date string. */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
