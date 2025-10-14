import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from './Loader'
import { useAuth } from '../context/AuthContext'

const AdminProtectedRoute = ({ children }) => {
  const { loading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') navigate('/admin')
    }
  }, [loading, user])

  if (loading) return <div className="container"><Loader /></div>
  if (!user || user.role !== 'admin') return null
  return children
}

export default AdminProtectedRoute
