/* Auth-related API calls */
import api from './client'

export const me = () => api.get('/auth/me').then(r => r.data)
export const signup = (payload) => api.post('/auth/signup', payload).then(r => r.data)
export const signin = (payload) => api.post('/auth/signin', payload).then(r => r.data)
export const adminSignin = (payload) => api.post('/auth/admin/signin', payload).then(r => r.data)
export const signout = () => api.post('/auth/signout').then(r => r.data)
export const verifyEmail = (token) => api.get('/auth/verify', { params: { token } }).then(r => r.data)
