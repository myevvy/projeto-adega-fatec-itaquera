import { api, apiErrorMessage, isAxiosError } from './api'

export type AuthUser = {
  id: number
  perfil_id: number
  nome: string
  email: string
  perfil: string
}

export type AuthSession = {
  token: string
  usuario: AuthUser
}

export type DirectoryUser = {
  id: number
  perfil_id: number
  tipo: string
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
}

export function isAdministratorProfile(profile: string | null | undefined) {
  return profile?.trim().toUpperCase() === 'ADMINISTRADOR'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
    )
    return isRecord(decoded) ? decoded : null
  } catch {
    return null
  }
}

export function getTokenExpiration(token: string): number | null {
  const expiration = getTokenPayload(token)?.exp
  return typeof expiration === 'number' ? expiration * 1000 : null
}

export function getTokenProfile(token: string): string | null {
  const profile = getTokenPayload(token)?.perfil
  return typeof profile === 'string' && profile.trim()
    ? profile.trim().toUpperCase()
    : null
}

async function requestJson(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options: { body?: unknown; token?: string } = {},
) {
  try {
    const response = await api.request({
      url: path,
      method,
      headers: {
        ...(options.token
          ? { Authorization: `Bearer ${options.token}` }
          : {}),
      },
      data: options.body,
    })
    return response.data
  } catch (error) {
    if (
      path === '/cadastro' &&
      method === 'POST' &&
      isAxiosError(error) &&
      error.response?.status === 404
    ) {
      throw new Error(
        'Não foi possível concluir o cadastro administrativo.',
        { cause: error },
      )
    }
    throw new Error(apiErrorMessage(error, 'Não foi possível concluir a solicitação.'), {
      cause: error,
    })
  }
}

export async function login(email: string, senha: string): Promise<AuthSession> {
  const result = await requestJson('/login', 'POST', {
    body: { email, senha },
  })

  if (
    !isRecord(result) ||
    typeof result.token !== 'string' ||
    !isRecord(result.usuario) ||
    typeof result.usuario.id !== 'number' ||
    typeof result.usuario.perfil_id !== 'number' ||
    typeof result.usuario.nome !== 'string' ||
    typeof result.usuario.email !== 'string' ||
    typeof result.token !== 'string'
  ) {
    throw new Error('Não foi possível concluir o acesso.')
  }

  const perfil = getTokenProfile(result.token)
  if (!perfil) {
    throw new Error('O token de acesso não contém o perfil do usuário.')
  }

  return {
    token: result.token,
    usuario: {
      id: result.usuario.id,
      perfil_id: result.usuario.perfil_id,
      nome: result.usuario.nome,
      email: result.usuario.email,
      perfil,
    },
  }
}

export async function listUsers(token: string): Promise<DirectoryUser[]> {
  const result = await requestJson('/usuarios', 'GET', { token })
  if (!Array.isArray(result)) {
    throw new Error('Não foi possível carregar a lista de usuários.')
  }

  return result.map((value) => {
    if (
      !isRecord(value) ||
      typeof value.id !== 'number' ||
      typeof value.perfil_id !== 'number' ||
      typeof value.tipo !== 'string' ||
      typeof value.nome !== 'string' ||
      typeof value.email !== 'string' ||
      (typeof value.telefone !== 'string' && value.telefone !== null) ||
      (typeof value.ativo !== 'boolean' &&
        value.ativo !== 0 &&
        value.ativo !== 1)
    ) {
      throw new Error('Não foi possível carregar os dados do usuário.')
    }

    return {
      id: value.id,
      perfil_id: value.perfil_id,
      tipo: value.tipo,
      nome: value.nome,
      email: value.email,
      telefone: value.telefone,
      ativo: value.ativo === true || value.ativo === 1,
    }
  })
}

export async function createCollaborator(
  token: string,
  input: {
    nome: string
    email: string
    telefone: string
    senha: string
  },
): Promise<{ id: number; nome: string; reativado: boolean }> {
  const result = await requestJson('/cadastro', 'POST', {
    token,
    body: {
      perfil_id: 2,
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      senha: input.senha,
    },
  })
  if (
    !isRecord(result) ||
    typeof result.id !== 'number' ||
    typeof result.nome !== 'string' ||
    typeof result.reativado !== 'boolean'
  ) {
    throw new Error('Não foi possível confirmar o cadastro do colaborador.')
  }
  return {
    id: result.id,
    nome: result.nome,
    reativado: result.reativado,
  }
}

export function updateUserProfile(
  token: string,
  userId: number,
  input: { nome: string; email: string; tel: string },
) {
  return requestJson(`/usuarios/${userId}`, 'PUT', {
    token,
    body: input,
  })
}

export function logout(token: string) {
  return requestJson('/logout', 'POST', { body: {}, token })
}

export function deactivateUser(token: string, userId: number) {
  return requestJson(`/usuarios/${userId}`, 'DELETE', { token })
}
