const KEY = 'mm_librerias_app_v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    // lightweight migrations for prototype
    if (!s.services) s.services = []
    if (s.products) {
      s.products = s.products.map((p) => ({
        ...p,
        saleUnit: p.saleUnit ?? p.unit ?? 'unidad',
        image: p.image ?? '',
      }))
    }
    if (s.stores) {
      s.stores = s.stores.map((t) => ({
        ...t,
        lat: t.lat ?? '',
        lng: t.lng ?? '',
        contactName: t.contactName ?? '',
        contactPhone: t.contactPhone ?? '',
        contactEmail: t.contactEmail ?? '',
      }))
    }
    if (s.warehouses) {
      s.warehouses = s.warehouses.map((w) => ({
        ...w,
        lat: w.lat ?? '',
        lng: w.lng ?? '',
      }))
    }
    return s
  } catch {
    return null
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function updateState(mutator) {
  const s = loadState()
  const next = mutator(structuredClone(s))
  saveState(next)
  return next
}

export function getNowISO() {
  return new Date().toISOString()
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}
