import React from 'react'
import { useAppState } from '../store/useAppState.jsx'
import { uid } from '../store/storage.js'
import { useToast } from '../ui/toast.jsx'
import Modal from '../ui/modal.jsx'

function osmLink(lat, lng) {
  const la = Number(lat)
  const ln = Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return ''
  return `https://www.openstreetmap.org/?mlat=${la}&mlon=${ln}#map=18/${la}/${ln}`
}

export default function Stores() {
  const { state, setState } = useAppState()
  const { push } = useToast()

  const [open, setOpen] = React.useState(false)

  const empty = React.useCallback(() => ({
    id: null,
    name: '',
    address: '',
    lat: '',
    lng: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    active: true,
  }), [])

  const [draft, setDraft] = React.useState(empty)

  const reset = () => setDraft(empty())

  const openCreate = () => { reset(); setOpen(true) }

  const openEdit = (t) => {
    setDraft({
      ...t,
      lat: t.lat ?? '',
      lng: t.lng ?? '',
      contactName: t.contactName ?? '',
      contactPhone: t.contactPhone ?? '',
      contactEmail: t.contactEmail ?? '',
    })
    setOpen(true)
  }

  const save = (e) => {
    e?.preventDefault?.()
    if (!draft.name.trim()) return

    setState((s) => {
      const payload = {
        ...draft,
        lat: String(draft.lat ?? '').trim(),
        lng: String(draft.lng ?? '').trim(),
      }
      if (!draft.id) s.stores.push({ ...payload, id: uid('store') })
      else {
        const idx = s.stores.findIndex((x) => x.id === draft.id)
        if (idx >= 0) s.stores[idx] = payload
      }
      return s
    })

    push('Tienda guardada', draft.id ? 'Cambios actualizados.' : 'Nueva tienda creada.')
    setOpen(false)
    reset()
  }

  const remove = (id) => {
    const hasWh = state.warehouses.some((w) => w.storeId === id)
    if (hasWh) {
      push('No se puede eliminar', 'Primero elimina o reasigna los almacenes de esta tienda.')
      return
    }
    setState((s) => {
      s.stores = s.stores.filter((t) => t.id !== id)
      return s
    })
    push('Tienda eliminada', 'Se removió del sistema.')
    setOpen(false)
    reset()
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Gestión de Tiendas</h1>
          <p className="sub">Ubicación geográfica + contacto. Multi-tienda.</p>
        </div>
        <div className="topbarRight">
          <button className="btn primary" onClick={openCreate}>+ Nueva</button>
        </div>
      </div>

      <div className="card pad">
        <table className="table">
          <thead>
            <tr>
              <th>Tienda</th>
              <th>Dirección</th>
              <th>Contacto</th>
              <th style={{ width: 180 }}>Ubicación</th>
              <th style={{ width: 110 }}>Estado</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {state.stores.map((t) => {
              const link = osmLink(t.lat, t.lng)
              const contact = [t.contactName, t.contactPhone].filter(Boolean).join(' · ')
              return (
                <tr key={t.id}>
                  <td><b>{t.name}</b></td>
                  <td>{t.address}</td>
                  <td>{contact || <span className="sub">—</span>}</td>
                  <td>{link ? <a className="badge" href={link} target="_blank" rel="noreferrer">🗺️ Ver mapa</a> : <span className="sub">—</span>}</td>
                  <td>{t.active ? 'Activa' : 'Inactiva'}</td>
                  <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn" onClick={() => openEdit(t)}>Editar</button>
                    <button className="btn danger" onClick={() => remove(t.id)}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={draft.id ? 'Editar tienda' : 'Nueva tienda'}
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
              <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ej: Tienda Surco" required />
            </div>

            <div className="col-12">
              <label className="label">Dirección</label>
              <input className="input" value={draft.address} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} placeholder="Distrito / referencia" />
            </div>

            <div className="col-6">
              <label className="label">Latitud</label>
              <input className="input" value={draft.lat} onChange={(e) => setDraft((d) => ({ ...d, lat: e.target.value }))} placeholder="Ej: -12.0464" />
            </div>
            <div className="col-6">
              <label className="label">Longitud</label>
              <input className="input" value={draft.lng} onChange={(e) => setDraft((d) => ({ ...d, lng: e.target.value }))} placeholder="Ej: -77.0428" />
            </div>

            <div className="col-6">
              <label className="label">Contacto (nombre)</label>
              <input className="input" value={draft.contactName} onChange={(e) => setDraft((d) => ({ ...d, contactName: e.target.value }))} placeholder="Ej: Rosa Pérez" />
            </div>
            <div className="col-6">
              <label className="label">Contacto (teléfono)</label>
              <input className="input" value={draft.contactPhone} onChange={(e) => setDraft((d) => ({ ...d, contactPhone: e.target.value }))} placeholder="Ej: +51 999 999 999" />
            </div>

            <div className="col-12">
              <label className="label">Contacto (email)</label>
              <input className="input" value={draft.contactEmail} onChange={(e) => setDraft((d) => ({ ...d, contactEmail: e.target.value }))} placeholder="Ej: tienda@mm.com" />
            </div>

            <div className="col-12" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input id="store_active" type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} />
              <label htmlFor="store_active" className="sub">Activa</label>
              {osmLink(draft.lat, draft.lng) ? (
                <a className="badge" href={osmLink(draft.lat, draft.lng)} target="_blank" rel="noreferrer">🗺️ Previsualizar mapa</a>
              ) : null}
            </div>
          </div>
          <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
        </form>
      </Modal>
    </>
  )
}
