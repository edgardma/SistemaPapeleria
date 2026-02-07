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

export default function Warehouses() {
  const { state, setState } = useAppState()
  const { push } = useToast()

  const [open, setOpen] = React.useState(false)

  const empty = React.useCallback(() => ({
    id: null,
    storeId: state.stores[0]?.id ?? '',
    name: '',
    address: '',
    lat: '',
    lng: '',
    active: true,
  }), [state.stores])

  const [draft, setDraft] = React.useState(empty)

  const reset = () => setDraft(empty())

  const openCreate = () => {
    reset()
    setOpen(true)
  }

  const openEdit = (w) => {
    setDraft({ ...w, lat: w.lat ?? '', lng: w.lng ?? '' })
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
      if (!draft.id) {
        s.warehouses.push({ ...payload, id: uid('wh') })
      } else {
        const idx = s.warehouses.findIndex((w) => w.id === draft.id)
        if (idx >= 0) s.warehouses[idx] = payload
      }
      return s
    })

    push('Almacén guardado', draft.id ? 'Cambios actualizados.' : 'Nuevo almacén creado.')
    setOpen(false)
    reset()
  }

  const remove = (id) => {
    setState((s) => {
      s.warehouses = s.warehouses.filter((w) => w.id !== id)
      for (const k of Object.keys(s.stock)) if (k.startsWith(id + ':')) delete s.stock[k]
      return s
    })
    push('Almacén eliminado', 'Se removió del sistema.')
    setOpen(false)
    reset()
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="h1">Gestión de Almacenes</h1>
          <p className="sub">Ubicación geográfica opcional. Stock se controla por almacén.</p>
        </div>
        <div className="topbarRight">
          <button className="btn primary" onClick={openCreate}>+ Nuevo</button>
        </div>
      </div>

      <div className="card pad">
        <table className="table">
          <thead>
            <tr>
              <th>Tienda</th>
              <th>Almacén</th>
              <th>Dirección</th>
              <th style={{ width: 180 }}>Ubicación</th>
              <th style={{ width: 110 }}>Estado</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {state.warehouses.map((w) => {
              const store = state.stores.find((s) => s.id === w.storeId)
              const link = osmLink(w.lat, w.lng)
              return (
                <tr key={w.id}>
                  <td>{store?.name ?? '—'}</td>
                  <td><b>{w.name}</b></td>
                  <td>{w.address}</td>
                  <td>{link ? <a className="badge" href={link} target="_blank" rel="noreferrer">🗺️ Ver mapa</a> : <span className="sub">—</span>}</td>
                  <td>{w.active ? 'Activo' : 'Inactivo'}</td>
                  <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn" onClick={() => openEdit(w)}>Editar</button>
                    <button className="btn danger" onClick={() => remove(w.id)}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        title={draft.id ? 'Editar almacén' : 'Nuevo almacén'}
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
              <label className="label">Tienda</label>
              <select className="select" value={draft.storeId} onChange={(e) => setDraft((d) => ({ ...d, storeId: e.target.value }))} required>
                {state.stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="label">Nombre</label>
              <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Ej: Almacén Central" required />
            </div>

            <div className="col-12">
              <label className="label">Dirección / Referencia</label>
              <input className="input" value={draft.address} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} placeholder="Ej: Backoffice" />
            </div>

            <div className="col-6">
              <label className="label">Latitud</label>
              <input className="input" value={draft.lat} onChange={(e) => setDraft((d) => ({ ...d, lat: e.target.value }))} placeholder="Ej: -12.0464" />
            </div>
            <div className="col-6">
              <label className="label">Longitud</label>
              <input className="input" value={draft.lng} onChange={(e) => setDraft((d) => ({ ...d, lng: e.target.value }))} placeholder="Ej: -77.0428" />
            </div>

            <div className="col-12" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input id="wh_active" type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} />
              <label htmlFor="wh_active" className="sub">Activo</label>
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
