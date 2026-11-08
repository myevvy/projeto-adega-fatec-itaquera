import usuarioModel from "../models/auth/usuarios.js";
import sessaoModel from "../models/auth/sessoes.js";
import "../../config/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

const getUsuarios = async (req, res) => {
  try {
    const { email } = req.query;
    const usuarios = await usuarioModel.getUsuario(email);

    return res.status(200).json(usuarios);
  } catch (erro) {
    console.error("Erro ao buscar usuários:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar usuários... Comunique-nos sobre o ocorrido",
    });
  }
};

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
        perfil: usuario.tipo,
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

const logout = async (req, res) => {
  try {
    const linhasAfetadas = await sessaoModel.encerrarSessao(req.tokenHash);

    if (!linhasAfetadas) {
      return res.status(401).json({
        mensagem: "Sessão não encontrada ou já encerrada.",
      });
    }

    return res.status(200).json({
      mensagem: "Logout realizado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no logout:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao deslogar usuário.",
    });
  }
};

const putUsuario = async (req, res) => {
  try {
    const idU = Number(req.params.id);
    const { id, perfil: perfil_logado } = req.usuario;

    if (id !== idU && perfil_logado !== "ADMINISTRADOR") {
      return res.status(403).json({
        mensagem: "Sem permissão.",
      });
    }

    const { nome, email, senha, end, cep, tel, aniversario, sobre, cargo } =
      req.body;

    const usuarioExiste = await usuarioModel.getUsuarioID(idU);

    if (!usuarioExiste) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    let senha_hash;

    if (senha) {
      senha_hash = await bcrypt.hash(senha, 10);
    }

    const atualizado = await usuarioModel.putUsuario(
      idU,
      nome,
      email,
      senha_hash,
      end,
      cep,
      tel,
      aniversario,
      sobre,
      cargo,
      perfil_logado,
    );

    if (!atualizado) {
      return res.status(400).json({
        mensagem: "Não foi possível atualizar o usuário.",
      });
    }

    return res.status(200).json({
      mensagem: "Usuário atualizado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no update:", erro.message);
    return res.status(500).json({
      mensagem: "Erro interno ao atualizar usuário.",
    });
  }
};

const desativarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: idUsuario } = req.usuario;

    if (Number(id) === Number(idUsuario)) {
      return res.status(403).json({
        mensagem: "Você não pode alterar o status da sua própria conta.",
      });
    }

    const usuarioExiste = await usuarioModel.getUsuarioID(id);

    if (!usuarioExiste) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    const atualizado = await usuarioModel.alterarStatus(id);

    if (!atualizado) {
      return res.status(400).json({
        mensagem: "Não foi possível alterar o status do usuário.",
      });
    }

    return res.status(200).json({
      mensagem: "Status do usuário alterado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no alterar status:", erro.message);

    return res.status(500).json({
      mensagem: "Erro ao alterar status do usuário.",
    });
  }
};

export default {
  getUsuarios,
  cadastro,
  login,
  logout,
  putUsuario,
  desativarUsuario,
};
