import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../store/useAppState.jsx'
import { uid, getNowISO } from '../store/storage.js'
import { useToast } from '../ui/toast.jsx'

export default function Register() {
  const { state, setState } = useAppState()
  const { push } = useToast()
  const nav = useNavigate()

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      const exists = state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())
      if (exists) {
        push('No se pudo registrar', 'Ese correo ya está en uso.')
        setBusy(false)
        return
      }
      const id = uid('user')
      setState((s) => {
        s.users.push({ id, name, email, password, role: 'USER', createdAt: getNowISO() })
        s.auth.sessionUserId = id
        return s
      })
      push('Cuenta creada', 'Tu sesión quedó iniciada.')
      nav('/', { replace: true })
    }, 350)
  }

  return (
    <form onSubmit={submit} className="card pad">
      <h3 style={{ margin: 0 }}>Registro</h3>
      <p className="sub" style={{ marginTop: 6 }}>Crea un usuario para probar el prototipo.</p>

      <div style={{ marginTop: 12 }}>
        <label className="label">Nombre</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="label">Correo</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="label">Contraseña</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mín. 6 caracteres" minLength={6} required />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <button className="btn primary" disabled={busy} type="submit">
          {busy ? 'Creando…' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  )
}
