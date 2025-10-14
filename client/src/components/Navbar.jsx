import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastContext'

const Navbar = () => {
  const { user, loading, signOut } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const doSignOut = async () => {
    await signOut()
    addToast('Signed out', 'success')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link className="brand" to="/">
          <span className="brand-icon">🎆</span>
          <span className="brand-text">MemberPro</span>
        </Link>
      </div>
      
      <div className="nav-menu">
        {loading ? (
          <div className="nav-loading">
            <div className="loader-sm"></div>
            <span>Loading...</span>
          </div>
        ) : user ? (
          <div className="nav-user">
            {user.role === 'admin' ? (
              <>
                <div className="nav-user-info">
                  <span className="nav-user-name">Admin</span>
                  <span className="nav-user-role">Administrator</span>
                </div>
                <Link className="btn btn-primary" to="/admin/dashboard">
                  <span>📈</span> Dashboard
                </Link>
                <button className="btn ghost" onClick={doSignOut}>
                  <span>🚺</span> Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.full_name || user.username}</span>
                  <span className="nav-user-role">Member</span>
                </div>
                <Link className="btn btn-primary" to="/dashboard">
                  <span>📄</span> Dashboard
                </Link>
                <button className="btn ghost" onClick={doSignOut}>
                  <span>🚺</span> Sign Out
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="nav-guest">
            <Link className="btn ghost" to="/signin">Sign In</Link>
            <Link className="btn btn-primary" to="/signup">Get Started</Link>
            <Link className="btn secondary" to="/admin">🔐 Admin</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
