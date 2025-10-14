import React, { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'

// Redirects the browser to the backend verify endpoint which then
// redirects back to /signin?verified=1. This avoids CORS/redirect
// complications when calling via XHR.
const Verify = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      navigate('/signin')
      return
    }
    // Hard-redirect to the API so server can finalize verification
    const apiBase = 'http://localhost:4000/api'
    window.location.href = `${apiBase}/auth/verify?token=${encodeURIComponent(token)}`
  }, [])

  return (
    <div className="container">
      <Navbar />
      <div className="card"><Loader label="Verifying your email..." /></div>
    </div>
  )
}

export default Verify
