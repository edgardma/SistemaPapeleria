const nf = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format number like 999,999.99 */
export function formatPrice(value) {
  const n = Number(value || 0)
  return nf.format(Number.isFinite(n) ? n : 0)
}

/** Parse a formatted price string like 1,234.50 -> 1234.5 */
export function parsePrice(text) {
  const raw = String(text ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(/,/g, '')
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function money(value, currency, settings) {
  const cur = settings.currencies.find((c) => c.code === currency) ?? { symbol: currency }
  return `${cur.symbol} ${formatPrice(value)}`
}

export function toBase(value, currency, settings) {
  const cur = settings.currencies.find((c) => c.code === currency)
  const rate = cur?.rateToBase ?? 1
  return Number(value || 0) * rate
}

export function clampInt(v) {
  const n = Math.round(Number(v || 0))
  return Number.isFinite(n) ? n : 0
}

export function fmtDateDMY(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = String(date.getFullYear())
  return `${dd}/${mm}/${yyyy}`
}
