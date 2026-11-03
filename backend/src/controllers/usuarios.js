import usuarioModel from "../models/usuarios.js";
import sessaoModel from "../models/sessoes.js";
import "../../config/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

const cadastro = async (req, res) => {
  try {
    const { perfil_id, nome, email, telefone, senha } = req.body;

    if (!perfil_id || !nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    const usuarioExiste = await usuarioModel.getUsuario(email);

    if (usuarioExiste) {
      return res.status(409).json({
        mensagem: "Esse usuário já existe.",
      });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const idUsuario = await usuarioModel.postUsuario(
      perfil_id,
      nome,
      email,
      senha_hash,
      telefone,
    );

    if (!idUsuario) {
      return res.status(400).json({
        mensagem: "Não foi possível cadastrar o usuário.",
      });
    }

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      id: idUsuario,
    });
  } catch (erro) {
    console.log("Erro no cadastro:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar usuário.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    const usuario = await usuarioModel.getUsuario(email);

    if (!usuario) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        mensagem: "Usuário desativado. Entre em contato com o administrador.",
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "Senha incorreta.",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil_id: usuario.perfil_id,
      },
      process.env.ASSINATURA_TOKEN,
      { expiresIn: "8h" },
    );

    const tokenHash = createHash("sha256").update(token).digest("hex");

    await sessaoModel.criarSessao(usuario.id, tokenHash);

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        perfil_id: usuario.perfil_id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (erro) {
    console.log("Erro no login:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao logar usuário.",
    });
  }
};

export default {
  cadastro,
  login,
};
