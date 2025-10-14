import React from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import AdminLogin from './pages/AdminLogin'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PublicProfile from './pages/PublicProfile'
import Verify from './pages/Verify'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/verify" element={<Verify />} />

      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

      <Route path="/share/:token" element={<PublicProfile />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
