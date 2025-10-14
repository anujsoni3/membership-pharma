/* Admin-related API calls */
import api from './client'

export const getSummary = () => api.get('/admin/summary').then(r => r.data)
export const listUsers = (params) => api.get('/admin/users', { params }).then(r => r.data)
export const updateUser = (id, payload) => api.put(`/admin/users/${id}`, payload).then(r => r.data)
export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then(r => r.data)
