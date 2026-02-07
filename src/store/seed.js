import { loadState, saveState, uid, getNowISO } from './storage.js'

export function seedIfEmpty() {
  const existing = loadState()
  if (existing) return

  const adminId = uid('user')
  const store1 = uid('store')
  const wh1 = uid('wh')
  const wh2 = uid('wh')

  const products = [
    { id: uid('prd'), sku: 'HB-A4-500', name: 'Hojas Bond A4 (500)', category: 'Papel', saleUnit: 'paquete', min: 10, max: 80, price: 18.5, currency: 'PEN', image: '', active: true },
    { id: uid('prd'), sku: 'LAP-AZ-001', name: 'Lapicero Azul', category: 'Escritura', saleUnit: 'unidad', min: 50, max: 500, price: 1.5, currency: 'PEN', image: '', active: true },
    { id: uid('prd'), sku: 'CUA-A4-100', name: 'Cuaderno A4 (100 hojas)', category: 'Cuadernos', saleUnit: 'unidad', min: 20, max: 200, price: 9.9, currency: 'PEN', image: '', active: true },
    { id: uid('prd'), sku: 'COL-12-STD', name: 'Colores (12) — Set Escolar', category: 'Arte', saleUnit: 'set', min: 8, max: 60, price: 14.0, currency: 'PEN', image: '', active: true },
    { id: uid('prd'), sku: 'PLU-12-STD', name: 'Plumones (12) — Set', category: 'Arte', saleUnit: 'set', min: 8, max: 60, price: 16.0, currency: 'PEN', image: '', active: true },
  ]

  const stock = {}
  for (const p of products) {
    stock[`${wh1}:${p.id}`] = Math.floor(p.min + (p.max - p.min) * 0.5)
    stock[`${wh2}:${p.id}`] = Math.floor(p.min + (p.max - p.min) * 0.35)
  }

  saveState({
    meta: { createdAt: getNowISO(), version: 1 },
    auth: { sessionUserId: null },
    users: [
      // Password stored as plain text only for prototype purposes.
      { id: adminId, name: 'Administrador', email: 'admin@mm.com', password: 'Admin123!', role: 'ADMIN', createdAt: getNowISO() },
    ],
    settings: {
      baseCurrency: 'PEN',
      currencies: [
        { code: 'PEN', name: 'Sol peruano', symbol: 'S/', rateToBase: 1 },
        { code: 'USD', name: 'Dólar', symbol: '$', rateToBase: 3.75 },
        { code: 'EUR', name: 'Euro', symbol: '€', rateToBase: 4.05 },
      ],
    },
    stores: [
      { id: store1, name: 'Tienda Principal', address: 'Lima, Perú', lat: '-12.0464', lng: '-77.0428', contactName: 'Administrador', contactPhone: '+51 999 999 999', contactEmail: 'admin@mm.com', active: true },
    ],
    warehouses: [
      { id: wh1, storeId: store1, name: 'Almacén Central', address: 'Backoffice', lat: '-12.0464', lng: '-77.0428', active: true },
      { id: wh2, storeId: store1, name: 'Almacén Tienda', address: 'Mostrador', lat: '-12.0464', lng: '-77.0428', active: true },
    ],
    products,
    stock,
    services: [
      { id: uid('srv'), name: 'Fotocopiado', description: 'Por hoja A4', price: 0.20, currency: 'PEN', active: true },
      { id: uid('srv'), name: 'Impresión B/N', description: 'Por hoja A4', price: 0.50, currency: 'PEN', active: true },
      { id: uid('srv'), name: 'Impresión a color', description: 'Por hoja A4', price: 1.50, currency: 'PEN', active: true },
    ],
    movements: [
      // { id, type: 'IN'|'OUT'|'ADJ', warehouseId, productId, qty, note, createdAt }
    ],
    inventories: [
      // { id, warehouseId, createdAt, status:'OPEN'|'CLOSED', lines:[{productId, systemQty, countedQty, diff}] }
    ],
  })
}
