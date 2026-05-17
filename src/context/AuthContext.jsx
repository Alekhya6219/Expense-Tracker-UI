import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialize from localStorage so refresh doesn't log you out
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, name, email: userEmail } = res.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ name, email: userEmail }))
    setUser({ name, email: userEmail })
    return res.data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    const { token, email: userEmail } = res.data

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ name, email: userEmail }))
    setUser({ name, email: userEmail })
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
