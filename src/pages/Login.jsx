import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppState } from '../store/useAppState.jsx'
import { useToast } from '../ui/toast.jsx'

export default function Login() {
  const { state, setState } = useAppState()
  const { push } = useToast()
  const nav = useNavigate()
  const loc = useLocation()

  const [email, setEmail] = React.useState('admin@mm.com')
  const [password, setPassword] = React.useState('Admin123!')
  const [busy, setBusy] = React.useState(false)

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
      if (!user) {
        push('No se pudo ingresar', 'Revisa tus credenciales.')
        setBusy(false)
        return
      }
      setState((s) => {
        s.auth.sessionUserId = user.id
        return s
      })
      push('Bienvenido', `Hola, ${user.name}.`)
      nav(loc.state?.from || '/', { replace: true })
    }, 350)
  }

  return (
    <form onSubmit={submit} className="card pad">
      <h3 style={{ margin: 0 }}>Login</h3>
      <p className="sub" style={{ marginTop: 6 }}>
        Accede para gestionar almacenes, stock e inventario.
      </p>

      <div style={{ marginTop: 12 }}>
        <label className="label">Correo</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="label">Contraseña</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <button className="btn primary" disabled={busy} type="submit">
          {busy ? 'Ingresando…' : 'Ingresar'}
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => {
            setEmail('admin@mm.com')
            setPassword('Admin123!')
            push('Demo cargada', 'Se restauraron las credenciales de ejemplo.')
          }}
        >
          Usar demo
        </button>
      </div>
    </form>
  )
}
