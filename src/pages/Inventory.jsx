import React from 'react'
import { useAppState } from '../store/useAppState.jsx'
import { uid, getNowISO } from '../store/storage.js'
import { clampInt } from '../lib/format.js'
import { useToast } from '../ui/toast.jsx'

export default function Inventory() {
  const { state, setState } = useAppState()
  const { push } = useToast()

  const [warehouseId, setWarehouseId] = React.useState(state.warehouses[0]?.id ?? '')
  const [selectedId, setSelectedId] = React.useState(null)

  const openForWh = state.inventories.filter((i) => i.warehouseId === warehouseId && i.status === 'OPEN')[0]

  React.useEffect(() => {
    if (!warehouseId && state.warehouses[0]) setWarehouseId(state.warehouses[0].id)
  }, [state.warehouses])

  React.useEffect(() => {
    setSelectedId(openForWh?.id ?? null)
  }, [warehouseId])

  const selected = state.inventories.find((i) => i.id === selectedId) ?? null

  const createInventory = () => {
    if (!warehouseId) return
    if (openForWh) {
      push('Inventario ya abierto', 'Cierra el inventario actual antes de crear otro.')
      return
    }

    setState((s) => {
      const id = uid('inv')
      const lines = s.products.map((p) => {
        const systemQty = Number(s.stock[`${warehouseId}:${p.id}`] || 0)
        return { productId: p.id, systemQty, countedQty: systemQty, diff: 0 }
      })
      s.inventories.unshift({ id, warehouseId, createdAt: getNowISO(), status: 'OPEN', lines })
      return s
    })
    push('Inventario creado', 'Edita conteos y luego cierra para aplicar ajustes.')
  }

  const updateLine = (productId, countedQtyRaw) => {
    const countedQty = clampInt(countedQtyRaw)
    setState((s) => {
      const inv = s.inventories.find((i) => i.id === selectedId)
      if (!inv) return s
      const line = inv.lines.find((l) => l.productId === productId)
      if (!line) return s
      line.countedQty = countedQty
      line.diff = countedQty - line.systemQty
      return s
    })
  }

  const closeAndApply = () => {
    if (!selected || selected.status !== 'OPEN') return
    setState((s) => {
      const inv = s.inventories.find((i) => i.id === selected.id)
      if (!inv) return s
      for (const line of inv.lines) {
        const k = `${inv.warehouseId}:${line.productId}`
        const before = Number(s.stock[k] || 0)
        const after = line.countedQty
        if (after !== before) {
          s.stock[k] = after
          s.movements.unshift({
            id: uid('mov'),
            type: 'ADJ',
            warehouseId: inv.warehouseId,
            productId: line.productId,
            qty: Math.abs(after - before),
            note: `Ajuste por inventario (${inv.id})`,
            createdAt: getNowISO(),
          })
        }
      }
      inv.status = 'CLOSED'
      inv.closedAt = getNowISO()
      return s
    })
    push('Inventario cerrado', 'Se aplicaron ajustes de stock.')
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Inventario</h1>
          <p className="sub">Inventario cíclico por almacén (conteo vs sistema).</p>
        </div>
      </div>

      <div className="row">
        <div className="col-4">
          <div className="card pad">
            <h3 style={{ margin: 0 }}>Control</h3>
            <p className="sub" style={{ marginTop: 6 }}>Crea un inventario, ajusta conteos y cierra.</p>

            <div style={{ marginTop: 10 }}>
              <label className="label">Almacén</label>
              <select className="select" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                {state.warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn primary" onClick={createInventory}>Crear inventario</button>
              <button className="btn" onClick={closeAndApply} disabled={!selected || selected.status !== 'OPEN'}>
                Cerrar y aplicar
              </button>
            </div>

            <hr className="hr" />

            <div className="sub">Historial</div>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {state.inventories.slice(0, 8).map((i) => {
                const wh = state.warehouses.find((w) => w.id === i.warehouseId)
                const active = i.id === selectedId
                return (
                  <button
                    key={i.id}
                    className="btn"
                    style={{
                      textAlign: 'left',
                      borderColor: active ? 'rgba(240,224,48,.35)' : undefined,
                      background: active ? 'rgba(240,224,48,.08)' : undefined,
                    }}
                    onClick={() => setSelectedId(i.id)}
                  >
                    <div style={{ fontWeight: 800 }}>{i.status === 'OPEN' ? '🟡 Abierto' : '✅ Cerrado'}</div>
                    <div className="sub">{wh?.name ?? '—'}</div>
                    <div className="sub">{new Date(i.createdAt).toLocaleString()}</div>
                  </button>
                )
              })}
              {state.inventories.length === 0 && <div className="sub">Aún no hay inventarios.</div>}
            </div>
          </div>
        </div>

        <div className="col-8">
          <div className="card pad">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>Detalle</h3>
              {selected && (
                <span className="badge">
                  {selected.status === 'OPEN' ? 'Abierto' : 'Cerrado'} • {selected.lines.length} ítems
                </span>
              )}
            </div>

            <hr className="hr" />

            {!selected ? (
              <p className="sub">Selecciona un inventario del historial o crea uno nuevo.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th style={{ width: 120 }}>Sistema</th>
                    <th style={{ width: 140 }}>Conteo</th>
                    <th style={{ width: 120 }}>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lines.map((l) => {
                    const p = state.products.find((x) => x.id === l.productId)
                    const diffColor = l.diff === 0 ? 'var(--muted)' : (l.diff > 0 ? 'var(--green)' : 'var(--red)')
                    return (
                      <tr key={l.productId}>
                        <td><b>{p?.sku ?? '—'}</b></td>
                        <td>{p?.name ?? '—'}</td>
                        <td>{l.systemQty}</td>
                        <td>
                          {selected.status === 'OPEN' ? (
                            <input
                              className="input"
                              style={{ padding: '8px 10px' }}
                              type="number"
                              min={0}
                              value={l.countedQty}
                              onChange={(e) => updateLine(l.productId, e.target.value)}
                            />
                          ) : (
                            l.countedQty
                          )}
                        </td>
                        <td style={{ color: diffColor, fontWeight: 900 }}>{l.diff}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
