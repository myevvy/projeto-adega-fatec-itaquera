import { useEffect, useState, type ReactNode } from 'react'
import {
  getTokenExpiration,
  getTokenProfile,
  login as loginRequest,
  logout as logoutRequest,
  type AuthSession,
} from '../services/authService'
import { AuthContext } from './auth-context'

const AUTH_STORAGE_KEY = 'adega.auth-session'

function readStoredSession(): AuthSession | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null

  try {
    const value: unknown = JSON.parse(stored)
    if (
      typeof value === 'object' &&
      value !== null &&
      'token' in value &&
      typeof value.token === 'string' &&
      'usuario' in value &&
      typeof value.usuario === 'object' &&
      value.usuario !== null &&
      'id' in value.usuario &&
      typeof value.usuario.id === 'number' &&
      'perfil_id' in value.usuario &&
      typeof value.usuario.perfil_id === 'number' &&
      'nome' in value.usuario &&
      typeof value.usuario.nome === 'string' &&
      'email' in value.usuario &&
      typeof value.usuario.email === 'string'
    ) {
      const expiration = getTokenExpiration(value.token)
      const perfil = getTokenProfile(value.token)
      if (expiration && expiration > Date.now() && perfil) {
        return {
          token: value.token,
          usuario: {
            id: value.usuario.id,
            perfil_id: value.usuario.perfil_id,
            nome: value.usuario.nome,
            email: value.usuario.email,
            perfil,
          },
        }
      }
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }

  localStorage.removeItem(AUTH_STORAGE_KEY)
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession)

  useEffect(() => {
    if (!session) return

    const expiration = getTokenExpiration(session.token) ?? Date.now()
    const timeout = window.setTimeout(() => {
      setSession(null)
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }, Math.max(0, expiration - Date.now()))

    return () => window.clearTimeout(timeout)
  }, [session])

  const login = async (email: string, senha: string) => {
    const authenticatedSession = await loginRequest(email, senha)
    const expiration = getTokenExpiration(authenticatedSession.token)
    if (!expiration || expiration <= Date.now()) {
      throw new Error('Não foi possível validar a sessão.')
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedSession))
    setSession(authenticatedSession)
    return authenticatedSession
  }

  const logout = async () => {
    if (!session) return
    await logoutRequest(session.token)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }

  const updateSessionUser = (
    user: Pick<AuthSession['usuario'], 'nome' | 'email'>,
  ) => {
    if (!session) return
    const updatedSession = {
      ...session,
      usuario: { ...session.usuario, ...user },
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession))
    setSession(updatedSession)
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, updateSessionUser }}>
      {children}
    </AuthContext.Provider>
  )
}
