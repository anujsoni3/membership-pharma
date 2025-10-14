import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signin } from '../api/auth'
import Navbar from '../components/Navbar'
import { useToast } from '../components/ToastContext'
import { useAuth } from '../context/AuthContext'

const SignIn = () => {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const { addToast } = useToast()
  const { refresh } = useAuth()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const [params] = useSearchParams()

  React.useEffect(() => {
    if (params.get('verified') === '1') setNotice('Email verified. You can sign in now.')
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setNotice('')
    try {
      await signin(form)
      addToast('Signed in successfully', 'success')
      await refresh()
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Sign in failed'
      setError(msg)
    }
  }

  return (
    <div className="container">
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>
          
          {notice && <div className="success mt-3">{notice}</div>}
          {error && <div className="error mt-3">{error}</div>}
          
          <form className="auth-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="label">Username or Email</label>
              <input 
                className="input" 
                name="usernameOrEmail" 
                value={form.usernameOrEmail} 
                onChange={onChange}
                placeholder="Enter your username or email"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="label">Password</label>
              <input 
                className="input" 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={onChange}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button className="btn btn-primary full-width" type="submit">
              Sign In
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link className="link" to="/signup">Create one here</Link></p>
          </div>
          
          <div className="auth-notice">
            <h4>Important Notes:</h4>
            <ul>
              <li>If your email is not verified, you'll see: "Please confirm your email before logging in."</li>
              <li>If your account is blocked, you'll see: "Your account is blocked. Please contact admin."</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
