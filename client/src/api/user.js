/* User-related API calls */
import api from './client'

export const getProfile = () => api.get('/user/profile').then(r => r.data)
export const updateProfile = (payload) => api.put('/user/profile', payload).then(r => r.data)

export const addEducation = (payload) => api.post('/user/education', payload).then(r => r.data)
export const updateEducation = (id, payload) => api.put(`/user/education/${id}`, payload).then(r => r.data)
export const deleteEducation = (id) => api.delete(`/user/education/${id}`).then(r => r.data)

export const addExperience = (payload) => api.post('/user/experience', payload).then(r => r.data)
export const updateExperience = (id, payload) => api.put(`/user/experience/${id}`, payload).then(r => r.data)
export const deleteExperience = (id) => api.delete(`/user/experience/${id}`).then(r => r.data)

export const uploadFiles = (formData) => api.post('/user/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)

export const listShareLinks = () => api.get('/user/share-links').then(r => r.data)
export const createShareLink = (days) => api.post('/user/share-links', { days }).then(r => r.data)
export const revokeShareLink = (id) => api.delete(`/user/share-links/${id}`).then(r => r.data)
