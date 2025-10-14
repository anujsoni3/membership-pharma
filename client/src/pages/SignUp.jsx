import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { signup } from '../api/auth'
import { useToast } from '../components/ToastContext'
import Navbar from '../components/Navbar'

const emptyEdu = { type: '', institution: '', degree: '', start_date: '', end_date: '' }
const emptyExp = { title: '', company: '', start_date: '', end_date: '', description: '', linkedin_url: '' }

const SignUp = () => {
  const { addToast } = useToast()
  const [form, setForm] = useState({
    username: '', password: '', full_name: '', phone_number: '', email: '', qualification: ''
  })
  const [education, setEducation] = useState([ { ...emptyEdu } ])
  const [experience, setExperience] = useState([ { ...emptyExp } ])
  const [resume, setResume] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const addEdu = () => setEducation([...education, { ...emptyEdu }])
  const removeEdu = (idx) => setEducation(education.filter((_, i) => i !== idx))
  const changeEdu = (idx, key, val) => setEducation(education.map((row, i) => i === idx ? { ...row, [key]: val } : row))

  const addExp = () => setExperience([...experience, { ...emptyExp }])
  const removeExp = (idx) => setExperience(experience.filter((_, i) => i !== idx))
  const changeExp = (idx, key, val) => setExperience(experience.map((row, i) => i === idx ? { ...row, [key]: val } : row))

  const validate = () => {
    setError('')
    if (!/^[a-zA-Z0-9]{3,}$/.test(form.username)) return setError('Username must be alphanumeric and min 3 characters')
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(form.password)) return setError('Password must be at least 8 chars with upper, lower, number, special char')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Invalid email')
    // Validate dynamic rows minimal requirements
    for (const e of education) {
      if (e.type && (!e.start_date || !e.end_date)) return setError('Education entries require start and end dates when type is set')
    }
    for (const x of experience) {
      if ((x.title || x.company) && (!x.start_date || !x.end_date)) return setError('Experience entries require start and end dates when title/company is set')
    }
    // File checks (optional): resume <=5MB; photo <=2MB
    if (resume && resume.size > 5 * 1024 * 1024) return setError('Resume must be <= 5MB')
    if (photo && photo.size > 2 * 1024 * 1024) return setError('Photo must be <= 2MB')
    return true
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSuccess(''); setError('')
    if (!validate()) return
    try {
      const fd = new FormData()
      // Core fields
      fd.append('username', form.username)
      fd.append('password', form.password)
      fd.append('full_name', form.full_name)
      fd.append('phone_number', form.phone_number)
      fd.append('email', form.email)
      fd.append('qualification', form.qualification)
      // Dynamic sections (JSON strings)
      fd.append('education', JSON.stringify(education))
      fd.append('experience', JSON.stringify(experience))
      // Optional files
      if (resume) fd.append('resume', resume)
      if (photo) fd.append('photo', photo)

      await signup(fd) // axios will set multipart/form-data automatically
      setSuccess('Signup successful. Please check your email to verify your account.')
      addToast('Account created. Please verify via email.', 'success')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Signup failed'
      setError(msg)
      addToast(msg, 'error')
    }
  }

  return (
    <div className="container">
      <Navbar />
      
      <div className="signup-container">
        <div className="signup-header">
          <h1>Join MemberPro</h1>
          <p>Create your professional profile with education, experience, and more</p>
        </div>
        
        {error && <div className="error mb-4">{error}</div>}
        {success && (
          <div className="success-card">
            <h3>Account Created Successfully! 🎉</h3>
            <p>{success}</p>
            <Link className="btn btn-primary" to="/signin">Continue to Sign In</Link>
          </div>
        )}

        {!success && (
          <form className="signup-form" onSubmit={onSubmit}>
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">📝 Personal Information</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Username *</label>
                  <input 
                    className="input" 
                    name="username" 
                    value={form.username} 
                    onChange={onChange} 
                    placeholder="e.g., john123" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Password *</label>
                  <input 
                    className="input" 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={onChange} 
                    placeholder="8+ chars, mixed case, numbers, symbols" 
                    required
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Full Name *</label>
                  <input 
                    className="input" 
                    name="full_name" 
                    value={form.full_name} 
                    onChange={onChange} 
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Phone Number</label>
                  <input 
                    className="input" 
                    name="phone_number" 
                    value={form.phone_number} 
                    onChange={onChange} 
                    placeholder="Your contact number"
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Email *</label>
                  <input 
                    className="input" 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={onChange} 
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Qualification</label>
                  <input 
                    className="input" 
                    name="qualification" 
                    value={form.qualification} 
                    onChange={onChange} 
                    placeholder="e.g., B.Tech, MBA, etc."
                  />
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">🎓 Education Background</h3>
                <button type="button" className="btn btn-primary" onClick={addEdu}>
                  + Add Education
                </button>
              </div>
              
              <div className="dynamic-items">
                {education.map((e, idx) => (
                  <div className="dynamic-item" key={idx}>
                    <div className="item-header">
                      <span className="item-number">#{idx + 1}</span>
                      <button 
                        type="button" 
                        className="btn danger remove-btn" 
                        onClick={() => removeEdu(idx)}
                        title="Remove this education entry"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="label">Education Type</label>
                        <input 
                          className="input" 
                          value={e.type} 
                          onChange={ev => changeEdu(idx, 'type', ev.target.value)} 
                          placeholder="High School, Bachelor's, Master's..."
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Institution</label>
                        <input 
                          className="input" 
                          value={e.institution} 
                          onChange={ev => changeEdu(idx, 'institution', ev.target.value)} 
                          placeholder="University/College name"
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Degree/Program</label>
                        <input 
                          className="input" 
                          value={e.degree} 
                          onChange={ev => changeEdu(idx, 'degree', ev.target.value)} 
                          placeholder="B.Tech, MBA, etc."
                        />
                      </div>
                    </div>
                    
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="label">Start Date</label>
                        <input 
                          className="input" 
                          type="date" 
                          value={e.start_date} 
                          onChange={ev => changeEdu(idx, 'start_date', ev.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">End Date</label>
                        <input 
                          className="input" 
                          type="date" 
                          value={e.end_date} 
                          onChange={ev => changeEdu(idx, 'end_date', ev.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          <div className="mt-4">
            <h3>Experience</h3>
            {experience.map((x, idx) => (
              <div className="card mt-3" key={idx}>
                <div className="grid-3">
                  <div>
                    <label className="label">Job Title</label>
                    <input className="input" value={x.title} onChange={ev => changeExp(idx, 'title', ev.target.value)} />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input className="input" value={x.company} onChange={ev => changeExp(idx, 'company', ev.target.value)} />
                  </div>
                  <div>
                    <label className="label">LinkedIn URL (optional)</label>
                    <input className="input" value={x.linkedin_url} onChange={ev => changeExp(idx, 'linkedin_url', ev.target.value)} />
                  </div>
                </div>
                <div className="grid-2 mt-3">
                  <div>
                    <label className="label">Start Date</label>
                    <input className="input" type="date" value={x.start_date} onChange={ev => changeExp(idx, 'start_date', ev.target.value)} />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input className="input" type="date" value={x.end_date} onChange={ev => changeExp(idx, 'end_date', ev.target.value)} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={x.description} onChange={ev => changeExp(idx, 'description', ev.target.value)} />
                </div>
                <div className="mt-3">
                  <button type="button" className="btn danger" onClick={() => removeExp(idx)}>Remove</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn mt-3" onClick={addExp}>Add Experience</button>
          </div>

          <div className="mt-4">
            <h3>Upload (optional)</h3>
            <div className="grid-2 mt-2">
              <div>
                <label className="label">Resume (pdf/doc/docx, max 5MB)</label>
                <input className="input" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files?.[0] || null)} />
                {resume && <div className="mt-2 banner">{resume.name}</div>}
              </div>
              <div>
                <label className="label">Photo (jpg/png, max 2MB)</label>
                <input className="input" type="file" accept="image/png,image/jpeg" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                {photo && <div className="mt-2 banner">{photo.name}</div>}
              </div>
            </div>
          </div>

          <div className="mt-4 flex">
            <button className="btn" type="submit">Create Account</button>
            <Link className="btn ghost" to="/signin">Have an account? Sign In</Link>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}

export default SignUp
