import React from 'react'
import { useAppState } from '../store/useAppState.jsx'
import { clampInt } from '../lib/format.js'
import { uid, getNowISO } from '../store/storage.js'
import { useToast } from '../ui/toast.jsx'
import Modal from '../ui/modal.jsx'

export default function StockMoves() {
  const { state, setState } = useAppState()
  const { push } = useToast()

  const [open, setOpen] = React.useState(false)

  const empty = React.useCallback(() => ({
    type: 'IN',
    warehouseId: state.warehouses[0]?.id ?? '',
    productId: state.products[0]?.id ?? '',
    qty: 1,
    note: ''
  }), [state.warehouses, state.products])

  const [draft, setDraft] = React.useState(empty)

  React.useEffect(() => {
    // keep defaults stable when data arrives
    if (!draft.warehouseId && state.warehouses[0]) setDraft((d) => ({ ...d, warehouseId: state.warehouses[0].id }))
    if (!draft.productId && state.products[0]) setDraft((d) => ({ ...d, productId: state.products[0].id }))
  }, [state.warehouses, state.products])

  const reset = () => setDraft(empty())

  const key = `${draft.warehouseId}:${draft.productId}`
  const current = Number(state.stock[key] || 0)

  const apply = (e) => {
    e?.preventDefault?.()
    const qty = clampInt(draft.qty)
    if (qty <= 0) return

    if (draft.type === 'OUT' && current - qty < 0) {
      push('Stock insuficiente', 'No puedes sacar más de lo disponible.')
      return
    }

    setState((s) => {
      const k = `${draft.warehouseId}:${draft.productId}`
      const now = getNowISO()
      const before = Number(s.stock[k] || 0)
      const after = draft.type === 'IN' ? before + qty : before - qty
      s.stock[k] = after
      s.movements.unshift({
        id: uid('mov'),
        type: draft.type,
        warehouseId: draft.warehouseId,
        productId: draft.productId,
        qty,
        note: draft.note?.trim() || '',
        createdAt: now,
      })
      return s
    })

    push('Movimiento registrado', draft.type === 'IN' ? 'Entrada aplicada.' : 'Salida aplicada.')
    setOpen(false)
    reset()
  }

  const wName = state.warehouses.find((w) => w.id === draft.warehouseId)?.name ?? '—'
  const pName = state.products.find((p) => p.id === draft.productId)
    ? `${state.products.find((p) => p.id === draft.productId).sku} — ${state.products.find((p) => p.id === draft.productId).name}`
    : '—'

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Movimientos de Stock</h1>
          <p className="sub">Registra entradas y salidas por almacén.</p>
        </div>
        <div className="topbarRight">
          <div className="badge">Stock actual: <b style={{ color: 'var(--gold)' }}>{current}</b></div>
          <button className="btn primary" onClick={() => { reset(); setOpen(true) }}>+ Nuevo</button>
        </div>
      </div>

      <div className="card pad">
        <h3 style={{ margin: 0 }}>Historial</h3>
        <p className="sub" style={{ marginTop: 6 }}>Últimos 20 movimientos</p>
        <hr className="hr" />
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Almacén</th>
              <th>Producto</th>
              <th style={{ width: 110 }}>Cantidad</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {state.movements.slice(0, 20).map((m) => {
              const w = state.warehouses.find((x) => x.id === m.warehouseId)
              const p = state.products.find((x) => x.id === m.productId)
              return (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td style={{ color: m.type === 'IN' ? 'var(--green)' : 'var(--red)', fontWeight: 800 }}>
                    {m.type === 'IN' ? 'IN' : 'OUT'}
                  </td>
                  <td>{w?.name ?? '—'}</td>
                  <td>{p ? `${p.sku} — ${p.name}` : '—'}</td>
                  <td><b>{m.qty}</b></td>
                  <td className="sub">{m.note}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title="Nuevo movimiento"
        onClose={() => { setOpen(false); reset() }}
        footer={(
          <>
            <button className="btn" onClick={() => { setOpen(false); reset() }}>Cancelar</button>
            <button className="btn primary" onClick={apply}>Aplicar</button>
          </>
        )}
      >
        <form onSubmit={apply}>
          <div className="badge" style={{ marginBottom: 12 }}>
            {wName} · {pName} · Stock: <b style={{ color: 'var(--gold)' }}>{current}</b>
          </div>

          <div className="row">
            <div className="col-6">
              <label className="label">Tipo</label>
              <select className="select" value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}>
                <option value="IN">Ingreso (Entrada)</option>
                <option value="OUT">Salida</option>
              </select>
            </div>
            <div className="col-6">
              <label className="label">Cantidad</label>
              <input className="input" type="number" value={draft.qty} onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))} min={1} />
            </div>

            <div className="col-12">
              <label className="label">Almacén</label>
              <select className="select" value={draft.warehouseId} onChange={(e) => setDraft((d) => ({ ...d, warehouseId: e.target.value }))}>
                {state.warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="label">Producto</label>
              <select className="select" value={draft.productId} onChange={(e) => setDraft((d) => ({ ...d, productId: e.target.value }))}>
                {state.products.map((p) => (
                  <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="label">Nota</label>
              <input className="input" value={draft.note} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} placeholder="Ej: Compra proveedor / Venta mostrador" />
            </div>
          </div>

          <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
        </form>
      </Modal>
    </>
  )
}
