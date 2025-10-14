import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'

const PublicProfile = () => {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/public/profile/${token}`).then(r => setData(r.data)).catch(err => setError(err?.response?.data?.error || 'Not found'))
  }, [token])

  if (error) return (
    <div className="container">
      <Navbar />
      <div className="card"><div className="error">{error}</div></div>
    </div>
  )
  if (!data) return <div className="container"><Navbar /><Loader /></div>

  const p = data.profile
  return (
    <div className="container">
      <Navbar />
      <div className="card">
        <div className="space-between">
          <h2>{p.full_name} ({p.member_id})</h2>
          {p.photo_url && <img src={p.photo_url} alt="photo" style={{ height: 56, borderRadius: 8 }} />}
        </div>
        <table className="table mt-3">
          <tbody>
            <tr><th>Email</th><td>{p.email}</td></tr>
            <tr><th>Phone</th><td>{p.phone_number || '-'}</td></tr>
            <tr><th>Qualification</th><td>{p.qualification || '-'}</td></tr>
            <tr><th>Resume</th><td>{p.resume_url ? <a className="link" href={p.resume_url} target="_blank">Download</a> : 'Not uploaded'}</td></tr>
          </tbody>
        </table>

        <h3 className="mt-4">Education</h3>
        <table className="table">
          <thead><tr><th>Type</th><th>Institution</th><th>Degree</th><th>Start</th><th>End</th></tr></thead>
          <tbody>
            {data.education.map(e => (
              <tr key={e._id}><td>{e.type}</td><td>{e.institution || '-'}</td><td>{e.degree || '-'}</td><td>{e.start_date?.slice(0,10)}</td><td>{e.end_date?.slice(0,10)}</td></tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-4">Experience</h3>
        <table className="table">
          <thead><tr><th>Title</th><th>Company</th><th>Start</th><th>End</th></tr></thead>
          <tbody>
            {data.experience.map(x => (
              <tr key={x._id}><td>{x.title}</td><td>{x.company}</td><td>{x.start_date?.slice(0,10)}</td><td>{x.end_date?.slice(0,10)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PublicProfile
