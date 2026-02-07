import React from 'react'
import { useAppState } from '../store/useAppState.jsx'
import { uid } from '../store/storage.js'
import { useToast } from '../ui/toast.jsx'
import { parsePrice, formatPrice, money } from '../lib/format.js'
import Modal from '../ui/modal.jsx'

export default function Services() {
  const { state, setState } = useAppState()
  const { push } = useToast()

  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')

  const empty = React.useCallback(() => ({
    id: null,
    name: '',
    description: '',
    price: 0,
    currency: state.settings.baseCurrency,
    active: true,
  }), [state.settings.baseCurrency])

  const [draft, setDraft] = React.useState(empty)
  const [priceText, setPriceText] = React.useState('0.00')

  const reset = () => {
    const d = empty()
    setDraft(d)
    setPriceText(formatPrice(d.price))
  }

  const openCreate = () => { reset(); setOpen(true) }
  const openEdit = (s) => { setDraft({ ...s }); setPriceText(formatPrice(s.price)); setOpen(true) }

  const save = (e) => {
    e?.preventDefault?.()
    if (!draft.name.trim()) return
    const price = parsePrice(priceText)

    setState((st) => {
      const payload = { ...draft, price }
      if (!draft.id) st.services.push({ ...payload, id: uid('srv') })
      else {
        const idx = st.services.findIndex((x) => x.id === draft.id)
        if (idx >= 0) st.services[idx] = payload
      }
      return st
    })

    push('Servicio guardado', draft.id ? 'Cambios actualizados.' : 'Nuevo servicio creado.')
    setOpen(false)
    reset()
  }

  const remove = (id) => {
    setState((st) => {
      st.services = st.services.filter((x) => x.id !== id)
      return st
    })
    push('Servicio eliminado', 'Se removió del catálogo de servicios.')
    setOpen(false)
    reset()
  }

  const filtered = (state.services || []).filter((s) => {
    const t = `${s.name} ${s.description}`.toLowerCase()
    return t.includes(q.toLowerCase())
  })

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Gestión de Servicios</h1>
          <p className="sub">Fotocopiado, impresiones, anillado, etc.</p>
        </div>
        <div className="topbarRight">
          <input className="input" style={{ maxWidth: 320 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar servicio…" />
          <button className="btn primary" onClick={openCreate}>+ Nuevo</button>
        </div>
      </div>

      <div className="card pad">
        <table className="table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Descripción</th>
              <th style={{ width: 160 }}>Precio</th>
              <th style={{ width: 110 }}>Estado</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td><b>{s.name}</b></td>
                <td className="sub">{s.description}</td>
                <td>{money(s.price, s.currency, state.settings)}</td>
                <td>{s.active ? 'Activo' : 'Inactivo'}</td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn" onClick={() => openEdit(s)}>Editar</button>
                  <button className="btn danger" onClick={() => remove(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="sub">Sin resultados.</p>}
      </div>

      <Modal
        open={open}
        title={draft.id ? 'Editar servicio' : 'Nuevo servicio'}
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
            <div className="col-12">
              <label className="label">Nombre</label>
              <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ej: Fotocopiado" required />
            </div>

            <div className="col-12">
              <label className="label">Descripción</label>
              <input className="input" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Ej: Por hoja A4" />
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

            <div className="col-12" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input id="srv_active" type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} />
              <label htmlFor="srv_active" className="sub">Activo</label>
            </div>
          </div>
          <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
        </form>
      </Modal>
    </>
  )
}
