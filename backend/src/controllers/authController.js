// controllers/authController.js
import '../../config/env.js';
import bcrypt from 'bcrypt';
import * as firebase from '../services/firebaseAuth.js';
import User from '../models/auth/usuarios.js'; // Ajuste o caminho se necessário

async function register(req, res) {
  const { perfil_id, nome, email, senha, telefone } = req.body;
  if (!perfil_id || !nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha perfil_id, nome, email e senha.' });
  }
  try {
    await firebase.cadastrar(email, senha);
    const idUsuario = await User.postUsuario(perfil_id, nome, email, null, telefone);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: idUsuario });
  } catch (err) {
    if (err.codigo === 'EMAIL_EXISTS') {
      return res.status(409).json({ erro: 'Email já cadastrado.' });
    }
    if (err.codigo && err.codigo.startsWith('WEAK_PASSWORD')) {
      return res.status(400).json({ erro: 'Senha fraca (mínimo 6 caracteres).' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar.' });
  }
}

async function login(req, res) {
  const { email, senha } = req.body;
  try {
    const fb = await firebase.entrar(email, senha);
    const user = await User.getUsuario(email);
    res.json({ token: fb.idToken, usuario: user });
  } catch (err) {
    res.status(401).json({ erro: 'Email ou senha inválidos.' });
  }
}

async function esqueciSenha(req, res) {
  const { email } = req.body;
  try {
    if (email) await firebase.enviarRecuperacaoSenha(email);
  } catch (err) {
    console.error('Recuperação:', err.codigo);
  }
  res.json({ mensagem: 'Se o e-mail estiver cadastrado, enviamos o link de recuperação.' });
}

async function redefinirSenha(req, res) {
  const { oobCode, senha } = req.body;
  if (!oobCode || !senha) {
    return res.status(400).json({ mensagem: 'Link ou senha inválidos.' });
  }

  try {
    const verificacao = await firebase.verificarRecuperacaoSenha(oobCode);
    if (!verificacao.email) {
      return res.status(400).json({ mensagem: 'O link expirou ou é inválido.' });
    }

    const usuario = await User.getUsuarioPorEmail(verificacao.email);
    if (!usuario) {
      return res.status(400).json({ mensagem: 'O link expirou ou é inválido.' });
    }

    await firebase.redefinirSenha(oobCode, senha);
    const senhaHash = await bcrypt.hash(senha, 10);
    const atualizado = await User.atualizarSenha(usuario.id, senhaHash);
    if (!atualizado) {
      throw new Error('A senha do usuário não foi atualizada no banco de dados.');
    }

    return res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });
  } catch (err) {
    if (
      err.codigo === 'INVALID_OOB_CODE' ||
      err.codigo === 'EXPIRED_OOB_CODE'
    ) {
      return res.status(400).json({ mensagem: 'O link expirou ou é inválido.' });
    }
    if (err.codigo?.startsWith('WEAK_PASSWORD')) {
      return res.status(400).json({ mensagem: 'A senha não atende aos requisitos do Firebase.' });
    }

    console.error('Erro ao redefinir senha:', err.codigo || err.message);
    return res.status(500).json({ mensagem: 'Não foi possível redefinir a senha.' });
  }
}

export default { register, login, esqueciSenha, redefinirSenha };