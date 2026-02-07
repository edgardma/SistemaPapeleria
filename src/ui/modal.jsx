import React from 'react'

export default function Modal({ open, title, children, onClose, footer }) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose?.()
    }}>
      <div className="modal card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <div className="modalTitle">{title}</div>
          </div>
          <button className="btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="modalBody">{children}</div>
        {footer ? <div className="modalFooter">{footer}</div> : null}
      </div>
    </div>
  )
}
