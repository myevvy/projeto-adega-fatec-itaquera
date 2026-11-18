import { useEffect, useState, type ReactNode } from 'react'
import {
  getTokenExpiration,
  getTokenProfile,
  isAuthenticationFailure,
  login as loginRequest,
  logout as logoutRequest,
  type AuthSession,
} from '../services/authService'
import {
  clearLoginFailures,
  getLockoutMessage,
  getLoginAttemptState,
  recordLoginFailure,
  MAX_LOGIN_ATTEMPTS,
} from '../services/loginLockout'
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
    const attemptState = await getLoginAttemptState(email)
    if (attemptState.lockedUntil !== null) {
      throw new Error(getLockoutMessage(attemptState.lockedUntil))
    }

    try {
      const authenticatedSession = await loginRequest(email, senha)
      const expiration = getTokenExpiration(authenticatedSession.token)
      if (!expiration || expiration <= Date.now()) {
        throw new Error('A API retornou um token inválido ou expirado.')
      }

      await clearLoginFailures(email)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedSession))
      setSession(authenticatedSession)
      return authenticatedSession
    } catch (error) {
      if (!isAuthenticationFailure(error)) throw error

      try {
        const nextAttemptState = await recordLoginFailure(email)
        if (nextAttemptState.lockedUntil !== null) {
          throw new Error(getLockoutMessage(nextAttemptState.lockedUntil), {
            cause: error,
          })
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível autenticar o usuário.'
        throw new Error(
          `${message} Tentativa ${nextAttemptState.failedAttempts} de ${MAX_LOGIN_ATTEMPTS}.`,
          { cause: error },
        )
      } catch (lockoutError) {
        if (
          lockoutError instanceof Error &&
          lockoutError.cause === error
        ) {
          throw lockoutError
        }
        throw new Error(
          `${
            error instanceof Error
              ? error.message
              : 'Não foi possível autenticar o usuário.'
          } Não foi possível salvar o bloqueio neste navegador.`,
          { cause: lockoutError },
        )
      }
    }
  }

  const logout = async () => {
    if (!session) return
    await logoutRequest(session.token)
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
