import React from 'react'

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="space-between">
          <h3>{title}</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
        <div className="mt-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal