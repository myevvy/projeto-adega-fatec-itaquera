const STORAGE_KEY_PREFIX = 'adega.login-lockout.'
export const MAX_LOGIN_ATTEMPTS = 3
export const LOGIN_LOCKOUT_DURATION_MS = 10 * 60 * 1000

export type LoginAttemptState = {
  failedAttempts: number
  lockedUntil: number | null
}

const emptyState: LoginAttemptState = {
  failedAttempts: 0,
  lockedUntil: null,
}

async function getStorageKey(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Informe um e-mail para verificar as tentativas de acesso.')
  }

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalizedEmail),
  )
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

  return `${STORAGE_KEY_PREFIX}${hash}`
}

function isLoginAttemptState(value: unknown): value is LoginAttemptState {
  return (
    typeof value === 'object' &&
    value !== null &&
    'failedAttempts' in value &&
    typeof value.failedAttempts === 'number' &&
    Number.isInteger(value.failedAttempts) &&
    value.failedAttempts >= 0 &&
    value.failedAttempts < MAX_LOGIN_ATTEMPTS &&
    'lockedUntil' in value &&
    (value.lockedUntil === null ||
      (typeof value.lockedUntil === 'number' &&
        Number.isFinite(value.lockedUntil) &&
        value.lockedUntil > 0))
  )
}

function storageError(error: unknown) {
  return new Error(
    'Não foi possível registrar o bloqueio de tentativas neste navegador.',
    { cause: error },
  )
}

export async function getLoginAttemptState(
  email: string,
): Promise<LoginAttemptState> {
  const key = await getStorageKey(email)
  let stored: string | null

  try {
    stored = localStorage.getItem(key)
  } catch (error) {
    throw storageError(error)
  }

  if (stored === null) return { ...emptyState }

  let value: unknown
  try {
    value = JSON.parse(stored)
  } catch (error) {
    throw new Error('O registro local de tentativas de acesso está inválido.', {
      cause: error,
    })
  }

  if (!isLoginAttemptState(value)) {
    throw new Error('O registro local de tentativas de acesso está inválido.')
  }

  if (value.lockedUntil !== null && value.lockedUntil <= Date.now()) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      throw storageError(error)
    }
    return { ...emptyState }
  }

  return value
}

export async function recordLoginFailure(
  email: string,
): Promise<LoginAttemptState> {
  const current = await getLoginAttemptState(email)
  if (current.lockedUntil !== null) return current

  const failedAttempts = current.failedAttempts + 1
  const next: LoginAttemptState =
    failedAttempts >= MAX_LOGIN_ATTEMPTS
      ? {
          failedAttempts: 0,
          lockedUntil: Date.now() + LOGIN_LOCKOUT_DURATION_MS,
        }
      : { failedAttempts, lockedUntil: null }

  const key = await getStorageKey(email)
  try {
    localStorage.setItem(key, JSON.stringify(next))
  } catch (error) {
    throw storageError(error)
  }

  return next
}

export async function clearLoginFailures(email: string) {
  const key = await getStorageKey(email)
  try {
    localStorage.removeItem(key)
  } catch (error) {
    throw storageError(error)
  }
}

export function getLockoutMessage(lockedUntil: number) {
  const remainingMinutes = Math.max(
    1,
    Math.ceil((lockedUntil - Date.now()) / 60_000),
  )
  return `Acesso temporariamente bloqueado após ${MAX_LOGIN_ATTEMPTS} tentativas. Tente novamente em ${remainingMinutes} minuto(s).`
}
