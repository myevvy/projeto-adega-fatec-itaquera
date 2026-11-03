import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import usuarioModel from "./usuarios.js";
import sessaoModel from "../models/usuarios.js";
import redefinicaoModel from "../models/redefinicao.js";

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MIN = 15;
const SESSAO_HORAS = 8;
const RESET_MIN = 60;

const sha256 = (valor) =>
  crypto.createHash("sha256").update(valor).digest("hex");

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res
        .status(400)
        .json({ mensagem: "Preencha os campos obrigatórios" });
    }

    const usuario = await usuarioModel.getUsuario(email.trim().toLowerCase());

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    }

    if (usuario.bloqueado) {
      return res.status(423).json({
        mensagem:
          "Conta temporariamente bloqueada. Tente novamente mais tarde.",
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      await usuarioModel.registrarFalha(
        usuario.id,
        MAX_TENTATIVAS,
        BLOQUEIO_MIN,
      );
      return res.status(401).json({ mensagem: "E-mail ou senha incorretos." });
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.ASSINATURA_TOKEN,
      { expiresIn: `${SESSAO_HORAS}h`, jwtid: crypto.randomUUID() },
    );

    await sessaoModel.criarSessao(
      usuario.id,
      sha256(token),
      req.ip,
      (req.get("user-agent") || "").slice(0, 255),
    );
    await usuarioModel.registrarLoginSucesso(usuario.id);

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (erro) {
    console.log("Erro no login: ", erro.message);
    return res.status(500).json({ mensagem: "Erro interno ao logar usuário" });
  }
};

const logout = async (req, res) => {
  try {
    await sessaoModel.encerrarSessao(req.tokenHash);
    return res.status(200).json({ mensagem: "Logout realizado com sucesso!" });
  } catch (erro) {
    console.log("Erro no logout: ", erro.message);
    return res
      .status(500)
      .json({ mensagem: "Erro interno ao deslogar usuário" });
  }
};

const solicitarRedefinicao = async (req, res) => {
  const respostaPadrao = {
    mensagem: "Se o e-mail estiver cadastrado, enviaremos as instruções.",
  };

  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ mensagem: "Preencha os campos obrigatórios" });
    }

    const usuario = await usuarioModel.getUsuario(email.trim().toLowerCase());
    if (!usuario || !usuario.ativo) {
      return res.status(200).json(respostaPadrao);
    }

    const token = crypto.randomBytes(32).toString("hex");

    await redefinicaoModel.invalidarAnteriores(usuario.id);
    await redefinicaoModel.criar(usuario.id, sha256(token), RESET_MIN);

    // TODO: enviar e-mail com o link:
    // `${process.env.FRONT_URL}/redefinir-senha?token=${token}`

    return res.status(200).json(respostaPadrao);
  } catch (erro) {
    console.log("Erro ao solicitar redefinição: ", erro.message);
    return res
      .status(500)
      .json({ mensagem: "Erro interno ao solicitar redefinição" });
  }
};

const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha) {
      return res
        .status(400)
        .json({ mensagem: "Preencha os campos obrigatórios" });
    }
    if (novaSenha.length < 8) {
      return res
        .status(400)
        .json({ mensagem: "A senha deve ter pelo menos 8 caracteres." });
    }

    const novoHash = await bcrypt.hash(novaSenha, 12);

    const ok = await redefinicaoModel.redefinirSenha(sha256(token), novoHash);

    if (!ok) {
      return res.status(400).json({ mensagem: "Token inválido ou expirado." });
    }

    return res.status(200).json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (erro) {
    console.log("Erro ao redefinir senha: ", erro.message);
    return res
      .status(500)
      .json({ mensagem: "Erro interno ao redefinir senha" });
  }
};

export default { login, logout, solicitarRedefinicao, redefinirSenha };
