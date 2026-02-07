import React from 'react'

const ToastCtx = React.createContext(null)

export function ToastProvider({ children }) {
  const [items, setItems] = React.useState([])

  const push = React.useCallback((title, message) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    setItems((x) => [...x, { id, title, message }])
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3800)
  }, [])

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast" aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <div key={t.id} className="item">
            <div className="t">{t.title}</div>
            <div className="m">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
