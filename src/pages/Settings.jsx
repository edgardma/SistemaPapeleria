import React from 'react'
import { useAppState } from '../store/useAppState.jsx'
import { useToast } from '../ui/toast.jsx'
import Modal from '../ui/modal.jsx'

export default function Settings() {
  const { state, setState } = useAppState()
  const { push } = useToast()

  const [open, setOpen] = React.useState(false)
  const [baseCurrency, setBaseCurrency] = React.useState(state.settings.baseCurrency)
  const [currencies, setCurrencies] = React.useState(() => state.settings.currencies.map((c) => ({ ...c })))

  React.useEffect(() => {
    // keep in sync when state changes
    setBaseCurrency(state.settings.baseCurrency)
    setCurrencies(state.settings.currencies.map((c) => ({ ...c })))
  }, [state.settings.baseCurrency])

  const save = () => {
    setState((s) => {
      s.settings.baseCurrency = baseCurrency
      s.settings.currencies = currencies.map((c) => ({ ...c, rateToBase: Number(c.rateToBase || 1) }))
      return s
    })
    push('Configuración guardada', 'Monedas y tipos de cambio actualizados.')
    setOpen(false)
  }

  const revert = () => {
    setBaseCurrency(state.settings.baseCurrency)
    setCurrencies(state.settings.currencies.map((c) => ({ ...c })))
    push('Revertido', 'Se restauró lo guardado en localStorage.')
  }

  const base = currencies.find((c) => c.code === baseCurrency)

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Configuración</h1>
          <p className="sub">Multi-moneda y tipo de cambio.</p>
        </div>
        <div className="topbarRight">
          <button className="btn primary" onClick={() => setOpen(true)}>Editar monedas</button>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <div className="card pad">
            <h3 style={{ margin: 0 }}>Moneda base</h3>
            <p className="sub" style={{ marginTop: 6 }}>Se usa para reportes y valoración de stock.</p>
            <div className="badge" style={{ marginTop: 10 }}>
              {base ? (
                <>
                  <b>{base.code}</b> — {base.name} · {base.symbol}
                </>
              ) : '—'}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card pad">
            <h3 style={{ margin: 0 }}>Tipos de cambio</h3>
            <p className="sub" style={{ marginTop: 6 }}>
              rateToBase = 1 unidad de moneda * rateToBase = {baseCurrency}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {currencies.map((c) => (
                <span key={c.code} className="badge">
                  <b>{c.code}</b> {String(c.rateToBase)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        title="Editar monedas y tipo de cambio"
        onClose={() => { setOpen(false); revert() }}
        footer={(
          <>
            <button className="btn" onClick={() => { setOpen(false); revert() }}>Cancelar</button>
            <button className="btn" onClick={revert}>Revertir</button>
            <button className="btn primary" onClick={save}>Guardar</button>
          </>
        )}
      >
        <div className="row">
          <div className="col-12">
            <label className="label">Moneda base</label>
            <select className="select" value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-12" style={{ marginTop: 6 }}>
            <hr className="hr" />
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Símbolo</th>
                  <th style={{ width: 160 }}>Rate a base</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((c, idx) => (
                  <tr key={c.code}>
                    <td><b>{c.code}</b></td>
                    <td>{c.name}</td>
                    <td>{c.symbol}</td>
                    <td>
                      <input
                        className="input"
                        style={{ padding: '8px 10px' }}
                        type="number"
                        step="0.0001"
                        min="0"
                        value={c.rateToBase}
                        onChange={(e) => {
                          const v = e.target.value
                          setCurrencies((arr) => {
                            const next = [...arr]
                            next[idx] = { ...next[idx], rateToBase: v }
                            return next
                          })
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  )
}
