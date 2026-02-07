import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="card pad" style={{ width: 'min(980px, 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div className="brand" style={{ border: 'none', background: 'transparent', padding: 0 }}>
            <img src="/logo.png" alt="M&M Librerías" />
            <div>
              <div className="t1">M&M Librerías</div>
              <div className="t2">Prototipo — Almacén e Inventarios</div>
            </div>
          </div>
          <div className="badge">
            <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--gold)' }} />
            Perú • Multi-tienda • Multi-moneda
          </div>
        </div>
        <hr className="hr" />
        <div className="row">
          <div className="col-6">
            <h2 style={{ margin: 0 }}>Acceso al sistema</h2>
            <p className="sub" style={{ marginTop: 8 }}>
              Credenciales demo: <b>admin@mm.com</b> / <b>Admin123!</b>
            </p>
            <ul className="sub">
              <li>Gestión de almacenes, tiendas y productos.</li>
              <li>Stock mínimo / máximo, movimientos de entrada/salida.</li>
              <li>Inventario cíclico y ajustes.</li>
              <li>Multi-moneda con tipo de cambio configurable.</li>
            </ul>
          </div>
          <div className="col-6">
            <Outlet />
            <p className="sub" style={{ marginTop: 10 }}>
              <Link to="/login">Login</Link> · <Link to="/registro">Registro</Link>
            </p>
          </div>
        </div>
      </div>
      <p className="sub" style={{ marginTop: 14 }}>
        Nota: prototipo offline (datos en localStorage). No usar en producción.
      </p>
    </div>
  )
}
