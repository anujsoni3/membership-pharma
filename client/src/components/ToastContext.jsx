import React, { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let idSeq = 1

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', timeout = 3000) => {
    const id = idSeq++
    setToasts(t => [...t, { id, message, type }])
    if (timeout) {
      setTimeout(() => removeToast(id), timeout)
    }
    return id
  }

  const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id))

  const value = useMemo(() => ({ addToast, removeToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}