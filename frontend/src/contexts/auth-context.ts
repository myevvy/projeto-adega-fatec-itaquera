import { createContext } from 'react'
import type { AuthSession } from '../services/authService'

export type AuthContextValue = {
  session: AuthSession | null
  login: (email: string, senha: string) => Promise<AuthSession>
  logout: () => Promise<void>
  updateSessionUser: (user: Pick<AuthSession['usuario'], 'nome' | 'email'>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
