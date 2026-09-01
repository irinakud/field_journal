import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { authApi, type AuthResponse } from '../api/client'

interface AuthContextValue {
  user: { username: string; email: string } | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<{ username: string; email: string } | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const persist = useCallback((data: AuthResponse) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }))
    setToken(data.token)
    setUser({ username: data.username, email: data.email })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password)
    persist(data)
  }, [persist])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { data } = await authApi.register(username, email, password)
    persist(data)
  }, [persist])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
