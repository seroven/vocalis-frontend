import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PublicUser } from './interfaces/auth.interface'
import { AuthService } from './services/AuthService'

type AuthContextValue = {
  user: PublicUser | null
  ready: boolean
  setUser: (user: PublicUser | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AuthService.me()
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
