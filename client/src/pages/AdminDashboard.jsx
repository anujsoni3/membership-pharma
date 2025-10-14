import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSummary, listUsers, updateUser, deleteUser } from '../api/admin'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastContext'

const AdminDashboard = () => {
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, blocked: 0 })
  const [table, setTable] = useState({ users: [], total: 0 })
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', sort: 'created_at', order: 'desc' })
  const [error, setError] = useState('')
  const [editModal, setEditModal] = useState({ open: false, id: null, form: { full_name: '', qualification: '', email_verified: false, is_blocked: false } })
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  const load = async () => {
    setError('')
    try {
      setSummary(await getSummary())
      setTable(await listUsers(query))
    } catch (e) { setError(e?.response?.data?.error || 'Load failed') }
  }

  useEffect(() => { load() }, [query.page, query.limit, query.search, query.sort, query.order])

  const openEdit = (u) => {
    setEditModal({ open: true, id: u._id, form: { full_name: u.full_name || '', qualification: u.qualification || '', email_verified: !!u.email_verified, is_blocked: !!u.is_blocked } })
  }

  const saveEdit = async () => {
    try {
      setSaving(true)
      const f = editModal.form
      await updateUser(editModal.id, { full_name: f.full_name, qualification: f.qualification, email_verified: f.email_verified, is_blocked: f.is_blocked })
      addToast('User updated', 'success')
      setEditModal(s => ({ ...s, open: false }))
      await load()
    } catch (e) {
      const m = e?.response?.data?.error || 'Update failed'
      setError(m)
      addToast(m, 'error')
    } finally {
      setSaving(false)
    }
  }

  const blockToggle = async (u, block) => {
    try {
      await updateUser(u._id, { is_blocked: !!block })
      addToast(block ? 'User blocked' : 'User unblocked', 'success')
      await load()
    } catch (e) { addToast(e?.response?.data?.error || 'Action failed', 'error') }
  }

  const removeUser = async (u) => {
    if (!confirm('Delete this user and all related data?')) return
    await deleteUser(u._id)
    await load()
  }

  return (
    <div className="container">
      <Navbar />
      
      {/* Admin Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          👨‍💼
        </div>
        <div className="profile-info">
          <h2>Admin Console</h2>
          <div className="member-id">System Administrator</div>
        </div>
      </div>
      
      {error && <div className="error mt-3">{error}</div>}

      <div className="kpis mt-3">
        <div className="kpi"><div>Total users</div><h2>{summary.total}</h2></div>
        <div className="kpi"><div>Active</div><h2>{summary.active}</h2></div>
        <div className="kpi"><div>Inactive</div><h2>{summary.inactive}</h2></div>
        <div className="kpi"><div>Blocked</div><h2>{summary.blocked}</h2></div>
      </div>

      <div className="card mt-3">
        <div className="space-between">
          <h3>Users</h3>
          <div className="flex">
            <input className="input" placeholder="Search..." value={query.search} onChange={e => setQuery({ ...query, search: e.target.value, page: 1 })} />
            <select className="input" value={query.sort} onChange={e => setQuery({ ...query, sort: e.target.value })}>
              <option value="created_at">Created</option>
              <option value="full_name">Name</option>
            </select>
            <select className="input" value={query.order} onChange={e => setQuery({ ...query, order: e.target.value })}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
        <table className="table mt-3">
          <thead>
            <tr><th>Username</th><th>Email</th><th>Name</th><th>Member ID</th><th>Verified</th><th>Blocked</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {table.users.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.full_name || '-'}</td>
                <td>{u.member_id || '-'}</td>
                <td>{u.email_verified ? 'Yes' : 'No'}</td>
                <td>{u.is_blocked ? 'Yes' : 'No'}</td>
                <td className="flex">
                  <button className="btn ghost" onClick={() => openEdit(u)}>Edit</button>
                  {u.is_blocked ? (
                    <button className="btn" onClick={() => blockToggle(u, false)}>Unblock</button>
                  ) : (
                    <button className="btn danger" onClick={() => blockToggle(u, true)}>Block</button>
                  )}
                  <button className="btn danger" onClick={() => removeUser(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex mt-3">
          <button className="btn ghost" disabled={query.page <= 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Prev</button>
          <div className="banner">Page {query.page}</div>
          <button className="btn" disabled={(query.page * query.limit) >= table.total} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Next</button>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal open={editModal.open} title="Edit User" onClose={() => setEditModal(s => ({ ...s, open: false }))}>
        <div className="grid-3">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={editModal.form.full_name} onChange={e => setEditModal(s => ({ ...s, form: { ...s.form, full_name: e.target.value } }))} />
          </div>
          <div>
            <label className="label">Qualification</label>
            <input className="input" value={editModal.form.qualification} onChange={e => setEditModal(s => ({ ...s, form: { ...s.form, qualification: e.target.value } }))} />
          </div>
          <div>
            <label className="label">Email Verified</label>
            <select className="input" value={editModal.form.email_verified ? 'yes' : 'no'} onChange={e => setEditModal(s => ({ ...s, form: { ...s.form, email_verified: e.target.value === 'yes' } }))}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Blocked</label>
          <select className="input" value={editModal.form.is_blocked ? 'yes' : 'no'} onChange={e => setEditModal(s => ({ ...s, form: { ...s.form, is_blocked: e.target.value === 'yes' } }))}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="mt-3 flex">
          <button className="btn" onClick={saveEdit} disabled={saving}>{saving ? (<><span className="spinner-sm"></span>Saving...</>) : 'Save'}</button>
          <button className="btn ghost" onClick={() => setEditModal(s => ({ ...s, open: false }))}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDashboard
