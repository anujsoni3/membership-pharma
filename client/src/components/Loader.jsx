import React from 'react'

const Loader = ({ label = 'Loading...' }) => (
  <div className="loader-wrap">
    <div className="loader" aria-label="loading"></div>
    <span style={{ marginLeft: 12 }}>{label}</span>
  </div>
)

export default Loader