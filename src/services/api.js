import axios from 'axios'

// VITE_API_URL: set in .env (local) or Vercel env vars (production)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

//  Request interceptor: attach JWT token 
//  Request interceptor: attach JWT token 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  // Skip token for auth APIs
  const isAuthRoute =
    config.url?.includes('/api/auth/login') ||
    config.url?.includes('/api/auth/register')
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

//  Response interceptor: auto-logout on 401 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

//  Auth 
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
}

//  Expenses 
export const expensesAPI = {
  getAll: (params) => api.get('/api/expenses', { params }),
  getById: (id) => api.get(`/api/expenses/${id}`),
  create: (data) => api.post('/api/expenses', data),
  update: (id, data) => api.put(`/api/expenses/${id}`, data),
  delete: (id) => api.delete(`/api/expenses/${id}`),
  getDashboard: () => api.get('/api/expenses/dashboard'),
}

export default api
