import React from 'react'
import { useAppState } from '../store/useAppState.jsx'
import { money, toBase } from '../lib/format.js'

function sumStock(state) {
  let total = 0
  for (const k in state.stock) total += Number(state.stock[k] || 0)
  return total
}

export default function Dashboard() {
  const { state } = useAppState()

  const low = []
  for (const wh of state.warehouses) {
    for (const p of state.products) {
      const key = `${wh.id}:${p.id}`
      const qty = Number(state.stock[key] || 0)
      if (qty < p.min) low.push({ wh, p, qty })
    }
  }

  const totalValueBase = (() => {
    let v = 0
    for (const wh of state.warehouses) {
      for (const p of state.products) {
        const qty = Number(state.stock[`${wh.id}:${p.id}`] || 0)
        v += qty * toBase(p.price, p.currency, state.settings)
      }
    }
    return v
  })()

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Dashboard</h1>
          <p className="sub">Resumen rápido de stock e inventario.</p>
        </div>
        <div className="badge">
          <span style={{ width: 8, height: 8, borderRadius: 99, background: low.length ? 'var(--red)' : 'var(--green)' }} />
          {low.length ? `${low.length} alertas de stock bajo` : 'Sin alertas de stock'}
        </div>
      </div>

      <div className="kpis">
        <div className="card pad kpi">
          <div className="v">{state.stores.length}</div>
          <div className="k">Tiendas</div>
        </div>
        <div className="card pad kpi">
          <div className="v">{state.warehouses.length}</div>
          <div className="k">Almacenes</div>
        </div>
        <div className="card pad kpi">
          <div className="v">{state.products.length}</div>
          <div className="k">Productos</div>
        </div>
        <div className="card pad kpi">
          <div className="v">{sumStock(state)}</div>
          <div className="k">Unidades en stock (total)</div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <div className="col-8">
          <div className="card pad">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>Alertas: stock por debajo del mínimo</h3>
              <span className="sub">Reglas: mínimo/máximo en ficha del producto</span>
            </div>
            <hr className="hr" />
            {low.length === 0 ? (
              <p className="sub">Todo bien: no hay productos por debajo del stock mínimo.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Almacén</th>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th style={{ width: 110 }}>Stock</th>
                    <th style={{ width: 120 }}>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {low.slice(0, 10).map((x) => (
                    <tr key={`${x.wh.id}:${x.p.id}`}>
                      <td>{x.wh.name}</td>
                      <td>{x.p.sku}</td>
                      <td>{x.p.name}</td>
                      <td><b style={{ color: 'var(--red)' }}>{x.qty}</b></td>
                      <td>{x.p.min}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-4">
          <div className="card pad">
            <h3 style={{ margin: 0 }}>Valor estimado del stock</h3>
            <p className="sub" style={{ marginTop: 6 }}>
              Convertido a moneda base ({state.settings.baseCurrency}) usando el tipo de cambio configurado.
            </p>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 10 }}>
              {money(totalValueBase, state.settings.baseCurrency, state.settings)}
            </div>
            <hr className="hr" />
            <p className="sub" style={{ margin: 0 }}>
              Consejo: define mínimos/máximos realistas por temporada escolar para evitar quiebres.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
