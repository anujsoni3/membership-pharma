import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { me as apiMe } from '../api/auth'
import api from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null) // { id, role, username, email, full_name, member_id }

  const refresh = async () => {
    try {
      const res = await apiMe()
      if (res.authenticated) setUser(res.user)
      else setUser(null)
    } catch {
      setUser(null)
    }
  }

  const signOut = async () => {
    try { await api.post('/auth/signout') } catch {}
    setUser(null)
  }

  useEffect(() => {
    (async () => {
      await refresh()
      setLoading(false)
    })()
  }, [])

  const value = useMemo(() => ({ loading, user, setUser, refresh, signOut }), [loading, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}