import { sendPasswordResetEmail as enviarEmailFirebase } from 'firebase/auth'
import { auth } from './firebase'

export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await enviarEmailFirebase(auth, email.trim())
  } catch (erro) {
    const code = (erro as { code?: string }).code

    // Não revela se o e-mail existe ou não
    if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
      return
    }

    if (code === 'auth/too-many-requests') {
      throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
    }

    throw new Error('Não foi possível solicitar a recuperação da senha.')
  }
}
