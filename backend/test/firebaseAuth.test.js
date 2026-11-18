import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

process.env.FIREBASE_API_KEY = 'test-api-key';
const firebase = await import('../src/services/firebaseAuth.js?firebase-auth-tests');
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('sends a password-reset email through Firebase Auth', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return { ok: true, json: async () => ({}) };
  };

  await firebase.enviarRecuperacaoSenha('funcionario@example.com');

  assert.equal(
    request.url,
    'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=test-api-key',
  );
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), {
    requestType: 'PASSWORD_RESET',
    email: 'funcionario@example.com',
  });
});

test('verifies a reset code before applying the new password', async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ email: 'funcionario@example.com' }) };
  };

  await firebase.verificarRecuperacaoSenha('one-time-code');
  await firebase.redefinirSenha('one-time-code', 'nova-senha-segura');

  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0].body, { oobCode: 'one-time-code' });
  assert.deepEqual(requests[1].body, {
    oobCode: 'one-time-code',
    newPassword: 'nova-senha-segura',
  });
});

test('preserves Firebase error codes for invalid reset links', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    json: async () => ({ error: { message: 'INVALID_OOB_CODE' } }),
  });

  await assert.rejects(
    firebase.verificarRecuperacaoSenha('expired-code'),
    (error) =>
      error.message === 'INVALID_OOB_CODE' &&
      error.codigo === 'INVALID_OOB_CODE',
  );
});
