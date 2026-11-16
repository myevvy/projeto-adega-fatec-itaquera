import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const localDevelopmentUrl = import.meta.env.DEV
  ? 'http://localhost:3000'
  : undefined
const apiBaseUrl = configuredApiUrl || localDevelopmentUrl

if (!apiBaseUrl) {
  throw new Error(
    'VITE_API_URL precisa estar configurada durante o build para usar a API em produção.',
  )
}

export const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ''),
  timeout: 20_000,
})

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined' || config.headers.has('Authorization')) {
    return config
  }

  const storedSession = window.localStorage.getItem('adega.auth-session')
  if (!storedSession) return config

  try {
    const session: unknown = JSON.parse(storedSession)
    if (
      typeof session === 'object' &&
      session !== null &&
      'token' in session &&
      typeof session.token === 'string'
    ) {
      config.headers.set('Authorization', `Bearer ${session.token}`)
    }
  } catch {
    return config
  }

  return config
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function apiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'A API não respondeu em 20 segundos. Verifique a conexão com o backend.'
    }

    if (!error.response) {
      return 'Não foi possível conectar à API. Verifique a URL e a disponibilidade do backend.'
    }

    const responseData: unknown = error.response.data
    if (isRecord(responseData) && typeof responseData.mensagem === 'string') {
      return responseData.mensagem
    }

    return `A API recusou a solicitação (HTTP ${error.response.status}).`
  }

  if (error instanceof Error) return error.message
  return fallback
}

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error)
}

export type ApiRequestConfig = AxiosRequestConfig
