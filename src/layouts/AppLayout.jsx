import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppState } from '../store/useAppState.jsx'
import { useToast } from '../ui/toast.jsx'
import { fmtDateDMY } from '../lib/format.js'

const Item = ({ to, children }) => (
  <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
    {children}
  </NavLink>
)

export default function AppLayout() {
  const { state, setState } = useAppState()
  const { push } = useToast()
  const nav = useNavigate()

  const me = state.users.find((u) => u.id === state.auth.sessionUserId)

  const logout = () => {
    setState((s) => {
      s.auth.sessionUserId = null
      return s
    })
    push('Sesión cerrada', 'Volviste a la pantalla de login.')
    nav('/login', { replace: true })
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.png" alt="M&M Librerías" />
          <div style={{ minWidth: 0 }}>
            <div className="t1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              M&M Librerías
            </div>
            <div className="t2">Inventarios & Almacén</div>
          </div>
        </div>

        <div className="nav" aria-label="Navegación">
          <Item to="/">🏠 Dashboard</Item>
          <Item to="/tiendas">🏬 Tiendas</Item>
          <Item to="/almacenes">🏗️ Almacenes</Item>
          <Item to="/productos">📦 Productos</Item>
          <Item to="/servicios">🛠️ Servicios</Item>
          <Item to="/movimientos">🔁 Movimientos</Item>
          <Item to="/inventario">🧾 Inventario</Item>
          <Item to="/configuracion">⚙️ Configuración</Item>
        </div>

        <hr className="hr" />

        <div className="card pad" style={{ background: 'rgba(255,255,255,.03)' }}>
          <div className="sub">Usuario</div>
          <div style={{ fontWeight: 700, marginTop: 2 }}>{me?.name ?? '—'}</div>
          <div className="sub">{me?.email ?? ''}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => push('Ayuda', 'Tip: usa Configuración para editar monedas y tipos de cambio.')}>
              💡 Tips
            </button>
            <button className="btn danger" onClick={logout}>
              Salir
            </button>
          </div>
        </div>
      </aside>

      <main className="container">
        <div className="topbar" style={{ marginTop: 4 }}>
          <div className="badge">📅 {fmtDateDMY(new Date())}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="sub" style={{ margin: 0 }}>Sesión:</span>
            <span style={{ fontWeight: 700 }}>{me?.name ?? '—'}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
