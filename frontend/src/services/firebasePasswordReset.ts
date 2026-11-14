const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY

export async function sendPasswordResetEmail(email: string) {
  if (!firebaseApiKey) {
    throw new Error(
      'A recuperação por Firebase ainda não está configurada. Defina VITE_FIREBASE_API_KEY.',
    )
  }

  let response: Response
  try {
    response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
      },
    )
  } catch {
    throw new Error('Não foi possível conectar ao serviço de recuperação do Firebase.')
  }

  const result: unknown = await response.json().catch(() => null)
  if (response.ok) return

  const errorCode =
    typeof result === 'object' &&
    result !== null &&
    'error' in result &&
    typeof result.error === 'object' &&
    result.error !== null &&
    'message' in result.error &&
    typeof result.error.message === 'string'
      ? result.error.message
      : ''

  if (errorCode.includes('INVALID_EMAIL')) {
    throw new Error('O Firebase não reconheceu esse endereço de e-mail.')
  }
  if (errorCode.includes('TOO_MANY_ATTEMPTS')) {
    throw new Error('Muitas tentativas. Aguarde um pouco antes de tentar novamente.')
  }
  if (errorCode.includes('API_KEY_INVALID') || errorCode.includes('CONFIGURATION_NOT_FOUND')) {
    throw new Error('A configuração do Firebase está inválida ou incompleta.')
  }

  throw new Error('O Firebase não conseguiu enviar o e-mail de recuperação.')
}
