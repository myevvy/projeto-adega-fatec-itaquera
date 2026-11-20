import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const localDevelopmentUrl = import.meta.env.DEV
  ? 'http://localhost:3000'
  : undefined
const apiBaseUrl = configuredApiUrl || localDevelopmentUrl

if (!apiBaseUrl) {
  throw new Error(
    'O serviço não está configurado para esta instalação.',
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
      return 'O serviço demorou demais para responder. Tente novamente.'
    }

    if (!error.response) {
      return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.'
    }

    const responseData: unknown = error.response.data
    if (isRecord(responseData) && typeof responseData.mensagem === 'string') {
      return responseData.mensagem
    }

    return 'Não foi possível concluir a solicitação. Tente novamente.'
  }

  if (error instanceof Error) return error.message
  return fallback
}

export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error)
}

export type ApiRequestConfig = AxiosRequestConfig
