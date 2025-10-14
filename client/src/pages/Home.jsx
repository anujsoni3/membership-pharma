import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Home = () => {
  return (
    <div className="container">
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Professional Membership Platform</h1>
          <p className="hero-subtitle">Manage your professional profile, showcase your education and experience, and share your resume with ease. Build your professional presence today.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/signup">Get Started</Link>
            <Link className="btn secondary" to="/signin">Sign In</Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📄</div>
          <h3>Resume Management</h3>
          <p>Upload and manage your resume with secure cloud storage and easy sharing capabilities.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎓</div>
          <h3>Education Tracking</h3>
          <p>Keep track of your educational background, certifications, and academic achievements.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💼</div>
          <h3>Experience Portfolio</h3>
          <p>Document your professional experience, projects, and career milestones in one place.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔗</div>
          <h3>Secure Sharing</h3>
          <p>Generate time-limited links to share your profile securely with employers and contacts.</p>
        </div>
      </div>

      {/* Admin Access */}
      <div className="admin-access">
        <p>System administrators can access the <Link className="link" to="/admin">Admin Console</Link></p>
      </div>
    </div>
  )
}

export default Home
