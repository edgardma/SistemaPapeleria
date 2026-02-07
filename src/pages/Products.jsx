import React from 'react'
import { useAppState } from '../store/useAppState.jsx'
import { uid } from '../store/storage.js'
import { clampInt, money, parsePrice, formatPrice } from '../lib/format.js'
import { useToast } from '../ui/toast.jsx'
import Modal from '../ui/modal.jsx'

const SALE_UNITS = [
  { code: 'unidad', label: 'Unidad' },
  { code: 'docena', label: 'Docena' },
  { code: 'millar', label: 'Millar' },
  { code: 'caja', label: 'Caja' },
  { code: 'paquete', label: 'Paquete' },
  { code: 'set', label: 'Set' },
]

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result || ''))
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function Products() {
  const { state, setState } = useAppState()
  const { push } = useToast()

  const [q, setQ] = React.useState('')
  const [open, setOpen] = React.useState(false)

  const empty = React.useCallback(() => ({
    id: null,
    sku: '',
    name: '',
    category: 'General',
    saleUnit: 'unidad',
    min: 0,
    max: 0,
    price: 0,
    currency: state.settings.baseCurrency,
    image: '',
    active: true,
  }), [state.settings.baseCurrency])

  const [draft, setDraft] = React.useState(empty)
  const [priceText, setPriceText] = React.useState('0.00')

  React.useEffect(() => {
    setPriceText(formatPrice(draft.price))
  }, [draft.id])

  const reset = () => {
    const d = empty()
    setDraft(d)
    setPriceText(formatPrice(d.price))
  }

  const openCreate = () => {
    reset()
    setOpen(true)
  }

  const openEdit = (p) => {
    setDraft({
      ...p,
      saleUnit: p.saleUnit ?? p.unit ?? 'unidad',
      image: p.image ?? '',
    })
    setPriceText(formatPrice(p.price))
    setOpen(true)
  }

  const save = (e) => {
    e?.preventDefault?.()
    if (!draft.sku.trim() || !draft.name.trim()) return

    const price = parsePrice(priceText)
    if (clampInt(draft.max) > 0 && clampInt(draft.min) > clampInt(draft.max)) {
      push('Validación', 'El stock mínimo no puede ser mayor al máximo.')
      return
    }

    setState((s) => {
      const payload = {
        ...draft,
        saleUnit: draft.saleUnit || 'unidad',
        min: clampInt(draft.min),
        max: clampInt(draft.max),
        price,
      }

      if (!draft.id) {
        const id = uid('prd')
        s.products.push({ ...payload, id })
        for (const wh of s.warehouses) s.stock[`${wh.id}:${id}`] = 0
      } else {
        const idx = s.products.findIndex((p) => p.id === draft.id)
        if (idx >= 0) s.products[idx] = payload
      }
      return s
    })

    push('Producto guardado', draft.id ? 'Cambios actualizados.' : 'Nuevo producto creado.')
    setOpen(false)
    reset()
  }

  const remove = (id) => {
    setState((s) => {
      s.products = s.products.filter((p) => p.id !== id)
      for (const wh of s.warehouses) delete s.stock[`${wh.id}:${id}`]
      return s
    })
    push('Producto eliminado', 'Se removió del catálogo.')
    setOpen(false)
    reset()
  }

  const onPickImage = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      push('Imagen', 'El archivo no es una imagen válida.')
      return
    }
    const dataUrl = await readFileAsDataURL(file)
    setDraft((d) => ({ ...d, image: dataUrl }))
  }

  const filtered = state.products.filter((p) => {
    const t = `${p.sku} ${p.name} ${p.category}`.toLowerCase()
    return t.includes(q.toLowerCase())
  })

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Gestión de Productos</h1>
          <p className="sub">Stock mínimo / máximo, imagen, unidad de venta y precio multi-moneda.</p>
        </div>
        <div className="topbarRight">
          <input className="input" style={{ maxWidth: 320 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por SKU, nombre, categoría…" />
          <button className="btn primary" onClick={openCreate}>+ Nuevo</button>
        </div>
      </div>

      <div className="card pad">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 54 }}></th>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th style={{ width: 110 }}>Min</th>
              <th style={{ width: 110 }}>Max</th>
              <th style={{ width: 140 }}>Precio</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.image ? (
                    <img src={p.image} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', border: '1px solid rgba(255,255,255,.10)' }} />
                  ) : (
                    <div className="badge" style={{ width: 44, height: 44, justifyContent: 'center' }}>📦</div>
                  )}
                </td>
                <td><b>{p.sku}</b></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.min}</td>
                <td>{p.max}</td>
                <td>{money(p.price, p.currency, state.settings)}</td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn" onClick={() => openEdit(p)}>Editar</button>
                  <button className="btn danger" onClick={() => remove(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="sub">Sin resultados.</p>}
      </div>

      <Modal
        open={open}
        title={draft.id ? 'Editar producto' : 'Nuevo producto'}
        onClose={() => { setOpen(false); reset() }}
        footer={(
          <>
            <button className="btn" onClick={() => { setOpen(false); reset() }}>Cancelar</button>
            <button className="btn primary" onClick={save}>Guardar</button>
          </>
        )}
      >
        <form onSubmit={save}>
          <div className="row">
            <div className="col-6">
              <label className="label">SKU</label>
              <input className="input" value={draft.sku} onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))} placeholder="Ej: LAP-AZ-001" required />
            </div>
            <div className="col-6">
              <label className="label">Unidad de venta</label>
              <select className="select" value={draft.saleUnit} onChange={(e) => setDraft((d) => ({ ...d, saleUnit: e.target.value }))}>
                {SALE_UNITS.map((u) => (
                  <option key={u.code} value={u.code}>{u.label}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="label">Nombre</label>
              <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ej: Lapicero Azul" required />
            </div>

            <div className="col-12">
              <label className="label">Categoría</label>
              <input className="input" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Ej: Escritura" />
            </div>

            <div className="col-6">
              <label className="label">Stock mínimo</label>
              <input className="input" type="number" value={draft.min} onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))} min={0} />
            </div>
            <div className="col-6">
              <label className="label">Stock máximo</label>
              <input className="input" type="number" value={draft.max} onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))} min={0} />
            </div>

            <div className="col-6">
              <label className="label">Precio</label>
              <input
                className="input"
                type="text"
                inputMode="decimal"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                onBlur={() => setPriceText(formatPrice(parsePrice(priceText)))}
                placeholder="0.00"
              />
            </div>
            <div className="col-6">
              <label className="label">Moneda</label>
              <select className="select" value={draft.currency} onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value }))}>
                {state.settings.currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="label">Imagen del producto</label>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {draft.image ? (
                  <img
                    src={draft.image}
                    alt="preview"
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 16,
                      objectFit: 'cover',
                      border: '1px solid rgba(255,255,255,.10)',
                    }}
                  />
                ) : (
                  <div className="badge" style={{ width: 76, height: 76, justifyContent: 'center' }}>🖼️</div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Input real oculto */}
                  <input
                    id="productImageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickImage(e.target.files?.[0])}
                    style={{ display: 'none' }}
                  />

                  {/* Botón con estética del sistema */}
                  <label htmlFor="productImageInput" className="btn" style={{ cursor: 'pointer' }}>
                    Elegir imagen
                  </label>

                  {/* Nombre del archivo (opcional) */}
                  <span className="fileHint">
                    {draft.image ? 'Imagen seleccionada' : 'Ningún archivo seleccionado'}
                  </span>

                  {draft.image ? (
                    <button className="btn" type="button" onClick={() => setDraft((d) => ({ ...d, image: '' }))}>
                      Quitar
                    </button>
                  ) : null}
                </div>
              </div>

              <p className="sub" style={{ marginTop: 6 }}>Se guarda localmente (localStorage) solo para el prototipo.</p>
            </div>

            <div className="col-12" style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
              <input id="prd_active" type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} />
              <label htmlFor="prd_active" className="sub">Activo</label>
            </div>
          </div>

          <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
        </form>
      </Modal>
    </>
  )
}
