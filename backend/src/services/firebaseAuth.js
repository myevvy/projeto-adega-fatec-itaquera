// services/firebaseAuth.js
const API_KEY = process.env.FIREBASE_API_KEY;
const BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';

async function chamar(endpoint, body) {
  if (!API_KEY) {
    throw new Error('FIREBASE_API_KEY não está configurada no backend.');
  }

  const resp = await fetch(`${BASE}:${endpoint}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) {
    const erro = new Error(data.error?.message || 'ERRO_FIREBASE');
    erro.codigo = data.error?.message;
    throw erro;
  }
  return data;
}

export function cadastrar(email, senha) {
  return chamar('signUp', { email, password: senha, returnSecureToken: true });
}

export function entrar(email, senha) {
  return chamar('signInWithPassword', {
    email,
    password: senha,
    returnSecureToken: true,
  });
}

export function enviarRecuperacaoSenha(email) {
  return chamar('sendOobCode', { requestType: 'PASSWORD_RESET', email });
}

export function verificarRecuperacaoSenha(oobCode) {
  return chamar('resetPassword', { oobCode });
}

export function redefinirSenha(oobCode, senha) {
  return chamar('resetPassword', { oobCode, newPassword: senha });
}