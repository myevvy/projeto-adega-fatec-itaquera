export type AuthUser = {
  id: number
  perfil_id: number
  nome: string
  email: string
}

export type AuthSession = {
  token: string
  usuario: AuthUser
}

type LoginResponse = {
  token: string
  usuario: AuthUser
}

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function postJson(path: string, body: unknown, token?: string) {
  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o backend está disponível.')
  }

  const responseText = await response.text()
  let result: unknown

  try {
    result = responseText ? JSON.parse(responseText) : {}
  } catch {
    if (response.ok) {
      throw new Error('A API retornou uma resposta inválida.')
    }
  }

  if (!response.ok) {
    const message =
      isRecord(result) && typeof result.mensagem === 'string'
        ? result.mensagem
        : `A API recusou a solicitação (HTTP ${response.status}).`
    throw new Error(message)
  }

  return result
}

export async function login(email: string, senha: string): Promise<AuthSession> {
  const result = await postJson('/login', { email, senha })

  if (
    !isRecord(result) ||
    typeof result.token !== 'string' ||
    !isRecord(result.usuario) ||
    typeof result.usuario.id !== 'number' ||
    typeof result.usuario.perfil_id !== 'number' ||
    typeof result.usuario.nome !== 'string' ||
    typeof result.usuario.email !== 'string'
  ) {
    throw new Error('A API retornou dados de login em um formato inesperado.')
  }

  return result as LoginResponse
}

export async function register(input: {
  nome: string
  email: string
  telefone: string
  senha: string
}) {
  const perfilId = Number(import.meta.env.VITE_ADMIN_PERFIL_ID)

  if (!Number.isInteger(perfilId) || perfilId <= 0) {
    throw new Error(
      'Configure VITE_ADMIN_PERFIL_ID com o ID do perfil de administrador antes de cadastrar.',
    )
  }

  return postJson('/cadastro', {
    perfil_id: perfilId,
    nome: input.nome,
    email: input.email,
    telefone: input.telefone,
    senha: input.senha,
  })
}

export function logout(token: string) {
  return postJson('/logout', {}, token)
}

export function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64)) as { exp?: unknown }
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}
