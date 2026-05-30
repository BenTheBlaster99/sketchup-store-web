'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { authApi } from '@/lib/api'
import type { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  token: string | null
  packCategoryIds: number[]
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [packCategoryIds, setPackCategoryIds] = useState<number[]>([])
  // Always true on server + first client paint — cookie is read only after mount.
  const [isLoading, setIsLoading] = useState(true)

  const refresh = async () => {
    try {
      const res = await authApi.me()
      setUser(res.data.user)
      setPackCategoryIds(res.data.pack_category_ids ?? [])
    } catch {
      setUser(null)
      setToken(null)
      Cookies.remove('auth_token')
    }
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const savedToken = Cookies.get('auth_token')

      if (!savedToken) {
        if (!cancelled) setIsLoading(false)
        return
      }

      setToken(savedToken)

      try {
        const res = await authApi.me()
        if (cancelled) return
        setUser(res.data.user)
        setPackCategoryIds(res.data.pack_category_ids ?? [])
      } catch {
        if (cancelled) return
        setUser(null)
        setToken(null)
        Cookies.remove('auth_token')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (newToken: string) => {
    Cookies.set('auth_token', newToken, { expires: 30 })
    setToken(newToken)
    await refresh()
    setIsLoading(false)
  }

  const logout = async () => {
    await authApi.logout().catch(() => {})
    Cookies.remove('auth_token')
    setUser(null)
    setToken(null)
    setPackCategoryIds([])
  }

  return (
    <AuthContext.Provider
      value={{ user, token, packCategoryIds, isLoading, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
