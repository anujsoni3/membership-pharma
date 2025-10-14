import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from './Loader'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { loading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'user') navigate('/signin')
    }
  }, [loading, user])

  if (loading) return <div className="container"><Loader /></div>
  if (!user || user.role !== 'user') return null
  return children
}

export default ProtectedRoute
