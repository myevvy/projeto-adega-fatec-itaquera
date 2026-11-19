import { signInWithEmailAndPassword, signOut } from 'firebase/auth' // NOVO
import { auth } from './firebase' // NOVO
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
  method: 'GET' | 'POST' | 'DELETE',
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
        'O backend não encontrou a rota de cadastro administrativo /cadastro.',
        { cause: error },
      )
    }
    throw new Error(apiErrorMessage(error, 'Não foi possível concluir a solicitação.'), {
      cause: error,
    })
  }
}

// NOVO: pega o idToken no Firebase (confere e-mail e senha lá)
async function getFirebaseIdToken(email: string, senha: string) {
  try {
    const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha)
    return await credencial.user.getIdToken()
  } catch (erro) {
    const code = (erro as { code?: string }).code

    if (code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
    }
    if (code === 'auth/user-disabled') {
      throw new Error('Usuário desativado. Entre em contato com o administrador.')
    }
    if (code === 'auth/network-request-failed') {
      throw new Error('Sem conexão. Verifique sua internet e tente novamente.')
    }
    // credencial inválida, usuário inexistente, senha errada etc.
    throw new Error('Usuário ou senha incorretos.')
  }
}

export async function login(email: string, senha: string): Promise<AuthSession> {
  // ALTERADO: em vez de mandar e-mail e senha, manda o idToken do Firebase
  const idToken = await getFirebaseIdToken(email, senha)

  const result = await requestJson('/login', 'POST', {
    body: { idToken },
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
    throw new Error('A API retornou dados de login em um formato inesperado.')
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
    throw new Error('A API retornou uma lista de usuários em formato inesperado.')
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
      throw new Error('A API retornou um usuário em formato inesperado.')
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
) {
  return requestJson('/cadastro', 'POST', {
    token,
    body: {
      perfil_id: 2,
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      senha: input.senha,
    },
  })
}

// ALTERADO: também encerra a sessão do Firebase no navegador
export async function logout(token: string) {
  try {
    return await requestJson('/logout', 'POST', { body: {}, token })
  } finally {
    await signOut(auth).catch(() => {})
  }
}

export function deactivateUser(token: string, userId: number) {
  return requestJson(`/usuarios/${userId}`, 'DELETE', { token })
}
