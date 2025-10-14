import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile, updateProfile, addEducation, updateEducation, deleteEducation, addExperience, updateExperience, deleteExperience, uploadFiles, listShareLinks, createShareLink, revokeShareLink } from '../api/user'
import { signout } from '../api/auth'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastContext'

const UserDashboard = () => {
  const { addToast } = useToast()
  const { signOut, refresh } = useAuth()
  const [data, setData] = useState({ user: null, education: [], experience: [] })
  const [edit, setEdit] = useState({ full_name: '', phone_number: '', qualification: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [links, setLinks] = useState([])
  const [uploadState, setUploadState] = useState({ resume: null, photo: null })
  const [eduModal, setEduModal] = useState({ open: false, mode: 'add', id: null, form: { type: '', institution: '', degree: '', start_date: '', end_date: '' } })
  const [expModal, setExpModal] = useState({ open: false, mode: 'add', id: null, form: { title: '', company: '', start_date: '', end_date: '', description: '', linkedin_url: '' } })

  const load = async () => {
    const res = await getProfile();
    setData(res)
    setEdit({ full_name: res.user?.full_name || '', phone_number: res.user?.phone_number || '', qualification: res.user?.qualification || '' })
    const l = await listShareLinks();
    setLinks(l.links || [])
  }

  useEffect(() => { load() }, [])

  const saveProfile = async () => {
    try {
      setMsg(''); setError('');
      await updateProfile(edit)
      setMsg('Profile updated')
      addToast('Profile updated', 'success')
      await load()
    } catch (e) {
      const m = e?.response?.data?.error || 'Update failed'
      setError(m)
      addToast(m, 'error')
    }
  }

  // Education modal handlers
  const openEduAdd = () => setEduModal({ open: true, mode: 'add', id: null, form: { type: '', institution: '', degree: '', start_date: '', end_date: '' } })
  const openEduEdit = (row) => setEduModal({ open: true, mode: 'edit', id: row._id, form: { type: row.type || '', institution: row.institution || '', degree: row.degree || '', start_date: (row.start_date||'').slice(0,10), end_date: (row.end_date||'').slice(0,10) } })
  const saveEdu = async () => {
    try {
      const f = eduModal.form
      if (!f.type || !f.start_date || !f.end_date) throw new Error('Please fill required fields for education')
      if (eduModal.mode === 'add') {
        await addEducation(f)
        addToast('Education added', 'success')
      } else {
        await updateEducation(eduModal.id, f)
        addToast('Education updated', 'success')
      }
      setEduModal(s => ({ ...s, open: false }))
      await load()
    } catch (e) { addToast(e?.response?.data?.error || e.message || 'Failed', 'error') }
  }
  const removeEdu = async (row) => {
    if (!confirm('Delete this education?')) return
    try {
      await deleteEducation(row._id)
      addToast('Education deleted', 'success')
      await load()
    } catch (e) { addToast(e?.response?.data?.error || 'Delete failed', 'error') }
  }

  // Experience modal handlers
  const openExpAdd = () => setExpModal({ open: true, mode: 'add', id: null, form: { title: '', company: '', start_date: '', end_date: '', description: '', linkedin_url: '' } })
  const openExpEdit = (row) => setExpModal({ open: true, mode: 'edit', id: row._id, form: { title: row.title || '', company: row.company || '', start_date: (row.start_date||'').slice(0,10), end_date: (row.end_date||'').slice(0,10), description: row.description || '', linkedin_url: row.linkedin_url || '' } })
  const saveExp = async () => {
    try {
      const f = expModal.form
      if (!f.title || !f.company || !f.start_date || !f.end_date) throw new Error('Please fill required fields for experience')
      if (expModal.mode === 'add') {
        await addExperience(f)
        addToast('Experience added', 'success')
      } else {
        await updateExperience(expModal.id, f)
        addToast('Experience updated', 'success')
      }
      setExpModal(s => ({ ...s, open: false }))
      await load()
    } catch (e) { addToast(e?.response?.data?.error || e.message || 'Failed', 'error') }
  }
  const removeExp = async (row) => {
    if (!confirm('Delete this experience?')) return
    try {
      await deleteExperience(row._id)
      addToast('Experience deleted', 'success')
      await load()
    } catch (e) { addToast(e?.response?.data?.error || 'Delete failed', 'error') }
  }

  const doUpload = async () => {
    try {
      setMsg(''); setError('');
      const fd = new FormData();
      if (uploadState.resume) fd.append('resume', uploadState.resume)
      if (uploadState.photo) fd.append('photo', uploadState.photo)
      await uploadFiles(fd)
      setMsg('Files updated')
      addToast('Files updated', 'success')
      setUploadState({ resume: null, photo: null })
      await load()
    } catch (e) { const m = e?.response?.data?.error || 'Upload failed'; setError(m); addToast(m, 'error') }
  }

  const createLink = async (days) => {
    try { await createShareLink(days); addToast('Share link created', 'success'); await load() } catch (e) { addToast(e?.response?.data?.error || 'Failed to create link', 'error') }
  }

  const revoke = async (id) => {
    try { await revokeShareLink(id); addToast('Share link revoked', 'success'); await load() } catch (e) { addToast(e?.response?.data?.error || 'Failed to revoke', 'error') }
  }

  const doSignout = async () => {
    await signOut()
    addToast('Signed out', 'success')
    setTimeout(() => { window.location.href = '/' }, 500)
  }

  const user = data.user || {}

  const getInitials = (name) => {
    if (!name) return user.username?.[0]?.toUpperCase() || 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="container">
      <Navbar />
      
      {/* Professional Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.photo_url ? (
            <img src={user.photo_url} alt="Profile" />
          ) : (
            getInitials(user.full_name || user.username)
          )}
        </div>
        <div className="profile-info">
          <h2>{user.full_name || user.username || 'User'}</h2>
          <div className="member-id">Member ID: {user.member_id || 'Not assigned'}</div>
        </div>
        <div className="flex" style={{marginLeft: 'auto'}}>
          <button className="btn ghost" onClick={doSignout}>Sign Out</button>
        </div>
      </div>

      {msg && <div className="success mt-3">{msg}</div>}
      {error && <div className="error mt-3">{error}</div>}

      <div className="card mt-3">
        <h3>Profile</h3>
        <div className="grid-3 mt-3">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={edit.full_name} onChange={e => setEdit({ ...edit, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={edit.phone_number} onChange={e => setEdit({ ...edit, phone_number: e.target.value })} />
          </div>
          <div>
            <label className="label">Qualification</label>
            <input className="input" value={edit.qualification} onChange={e => setEdit({ ...edit, qualification: e.target.value })} />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn" onClick={saveProfile}>Save Changes</button>
        </div>

        <div className="mt-4">
          <table className="table">
            <tbody>
              <tr><th>Username</th><td>{user.username}</td></tr>
              <tr><th>Email</th><td>{user.email}</td></tr>
              <tr><th>Member ID</th><td>{user.member_id || '-'}</td></tr>
              <tr><th>Resume</th><td>{user.resume_url ? (
                <div className="flex">
                  <a className="btn" href={"http://localhost:4000/api/user/resume/download"}>Download</a>
                </div>
              ) : 'Not uploaded'}</td></tr>
              <tr><th>Photo</th><td>{user.photo_url ? <img src={user.photo_url} alt="photo" style={{ height: 48, borderRadius: 6 }} /> : 'Not uploaded'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-3">
        <div className="space-between">
          <h3>Education</h3>
          <button className="btn" onClick={openEduAdd}>Add Education</button>
        </div>
        <table className="table mt-3">
          <thead><tr><th>Type</th><th>Institution</th><th>Degree</th><th>Start</th><th>End</th><th>Actions</th></tr></thead>
          <tbody>
            {data.education.map(row => (
              <tr key={row._id}>
                <td>{row.type}</td>
                <td>{row.institution || '-'}</td>
                <td>{row.degree || '-'}</td>
                <td>{row.start_date?.slice(0,10)}</td>
                <td>{row.end_date?.slice(0,10)}</td>
                <td className="flex">
                  <button className="btn ghost" onClick={() => openEduEdit(row)}>Edit</button>
                  <button className="btn danger" onClick={() => removeEdu(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-3">
        <div className="space-between">
          <h3>Experience</h3>
          <button className="btn" onClick={openExpAdd}>Add Experience</button>
        </div>
        <table className="table mt-3">
          <thead><tr><th>Title</th><th>Company</th><th>Start</th><th>End</th><th>Actions</th></tr></thead>
          <tbody>
            {data.experience.map(row => (
              <tr key={row._id}>
                <td>{row.title}</td>
                <td>{row.company}</td>
                <td>{row.start_date?.slice(0,10)}</td>
                <td>{row.end_date?.slice(0,10)}</td>
                <td className="flex">
                  <button className="btn ghost" onClick={() => openExpEdit(row)}>Edit</button>
                  <button className="btn danger" onClick={() => removeExp(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card mt-3">
        <h3>Upload Resume & Photo</h3>
        <div className="grid-2 mt-2">
          <div>
            <label className="label">Resume (pdf/doc/docx, max 5MB)</label>
            <input className="input" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setUploadState(s => ({ ...s, resume: e.target.files?.[0] || null }))} />
          </div>
          <div>
            <label className="label">Photo (jpg/png, max 2MB)</label>
            <input className="input" type="file" accept="image/png,image/jpeg" onChange={(e) => setUploadState(s => ({ ...s, photo: e.target.files?.[0] || null }))} />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn" onClick={doUpload}>Upload/Replace</button>
        </div>
      </div>

      <div className="card mt-3">
        <div className="space-between">
          <h3>Share Profile</h3>
          <div className="flex">
            <button className="btn" onClick={() => createLink(1)}>Create 1-day link</button>
            <button className="btn ghost" onClick={() => createLink(2)}>Create 2-day link</button>
          </div>
        </div>
        <table className="table mt-3">
          <thead><tr><th>Created</th><th>Expires</th><th>View</th><th>Status</th><th>Delete</th></tr></thead>
          <tbody>
            {links.map(l => (
              <tr key={l._id}>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td>{new Date(l.expires_at).toLocaleString()}</td>
                <td><a className="link" href={`/share/${l.token}`} target="_blank">Open</a></td>
                <td>{l.status}</td>
                <td><button className="btn danger" onClick={() => revoke(l._id)}>Revoke</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Education Modal */}
      <Modal open={eduModal.open} title={eduModal.mode === 'add' ? 'Add Education' : 'Edit Education'} onClose={() => setEduModal(s => ({ ...s, open: false }))}>
        <div className="grid-3">
          <div>
            <label className="label">Type</label>
            <input className="input" value={eduModal.form.type} onChange={e => setEduModal(s => ({ ...s, form: { ...s.form, type: e.target.value } }))} />
          </div>
          <div>
            <label className="label">Institution</label>
            <input className="input" value={eduModal.form.institution} onChange={e => setEduModal(s => ({ ...s, form: { ...s.form, institution: e.target.value } }))} />
          </div>
          <div>
            <label className="label">Degree</label>
            <input className="input" value={eduModal.form.degree} onChange={e => setEduModal(s => ({ ...s, form: { ...s.form, degree: e.target.value } }))} />
          </div>
        </div>
        <div className="grid-2 mt-3">
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={eduModal.form.start_date} onChange={e => setEduModal(s => ({ ...s, form: { ...s.form, start_date: e.target.value } }))} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date" value={eduModal.form.end_date} onChange={e => setEduModal(s => ({ ...s, form: { ...s.form, end_date: e.target.value } }))} />
          </div>
        </div>
        <div className="mt-3 flex">
          <button className="btn" onClick={saveEdu}>{eduModal.mode === 'add' ? 'Add' : 'Save'}</button>
          <button className="btn ghost" onClick={() => setEduModal(s => ({ ...s, open: false }))}>Cancel</button>
        </div>
      </Modal>

      {/* Experience Modal */}
      <Modal open={expModal.open} title={expModal.mode === 'add' ? 'Add Experience' : 'Edit Experience'} onClose={() => setExpModal(s => ({ ...s, open: false }))}>
        <div className="grid-3">
          <div>
            <label className="label">Title</label>
            <input className="input" value={expModal.form.title} onChange={e => setExpModal(s => ({ ...s, form: { ...s.form, title: e.target.value } }))} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" value={expModal.form.company} onChange={e => setExpModal(s => ({ ...s, form: { ...s.form, company: e.target.value } }))} />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input className="input" value={expModal.form.linkedin_url} onChange={e => setExpModal(s => ({ ...s, form: { ...s.form, linkedin_url: e.target.value } }))} />
          </div>
        </div>
        <div className="grid-2 mt-3">
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={expModal.form.start_date} onChange={e => setExpModal(s => ({ ...s, form: { ...s.form, start_date: e.target.value } }))} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date" value={expModal.form.end_date} onChange={e => setExpModal(s => ({ ...s, form: { ...s.form, end_date: e.target.value } }))} />
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={expModal.form.description} onChange={e => setExpModal(s => ({ ...s, form: { ...s.form, description: e.target.value } }))} />
        </div>
        <div className="mt-3 flex">
          <button className="btn" onClick={saveExp}>{expModal.mode === 'add' ? 'Add' : 'Save'}</button>
          <button className="btn ghost" onClick={() => setExpModal(s => ({ ...s, open: false }))}>Cancel</button>
        </div>
      </Modal>

    </div>
  )
}

export default UserDashboard
