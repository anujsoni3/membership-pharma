import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminSignin } from '../api/auth'
import Navbar from '../components/Navbar'
import { useToast } from '../components/ToastContext'
import { useAuth } from '../context/AuthContext'

const AdminLogin = () => {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const { addToast } = useToast()
  const { refresh } = useAuth()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      await adminSignin(form)
      addToast('Admin signed in', 'success')
      await refresh()
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || 'Admin login failed')
    }
  }

  return (
    <div className="container">
      <Navbar />
      <div className="card">
        <h2>Admin Login</h2>
        {error && <div className="error mt-3">{error}</div>}
        <form className="mt-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Username or Email</label>
            <input className="input" name="usernameOrEmail" value={form.usernameOrEmail} onChange={onChange} />
          </div>
          <div className="mt-3">
            <label className="label">Password</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} />
          </div>
          <div className="mt-4 flex">
            <button className="btn" type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
