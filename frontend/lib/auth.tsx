'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface AuthUser { id: string; name: string; email: string }
interface AuthCtx {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('snyderhealth_token')
    const storedUser = localStorage.getItem('snyderhealth_user')
    if (stored && storedUser) {
      setToken(stored)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return data.error || 'Login failed'
    localStorage.setItem('snyderhealth_token', data.token)
    localStorage.setItem('snyderhealth_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return null
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    const res = await fetch(`${API}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) return data.error || 'Signup failed'
    localStorage.setItem('snyderhealth_token', data.token)
    localStorage.setItem('snyderhealth_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return null
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('snyderhealth_token')
    localStorage.removeItem('snyderhealth_user')
    setToken(null)
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
