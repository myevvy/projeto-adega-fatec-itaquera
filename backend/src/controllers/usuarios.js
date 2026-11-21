import usuarioModel from "../models/auth/usuarios.js";
import sessaoModel from "../models/auth/sessoes.js";
import "../../config/env.js";
import admin from "../../config/firebaseAdmin.js"; // NOVO (Firebase)
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
      mensagem: "Não foi possível carregar os usuários.",
    });
  }
};

const cadastro = async (req, res) => {
  // NOVO (Firebase): fica fora do try para o catch poder desfazer a criação no Firebase
  let firebaseUid = null;
  let salvoNoBanco = false;

  try {
    // O perfil_id é fornecido pelo próprio front-end
    const { perfil_id, nome, email, telefone, senha } = req.body;

    if (!perfil_id || !nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    const perfilValido = await usuarioModel.verificaPerfil(perfil_id);

    if (!perfilValido) {
      return res.status(400).json({
        mensagem: "Perfil inválido.",
      });
    }

    const usuarioExiste = await usuarioModel.getUsuarioPorEmail(email);

    if (usuarioExiste) {
      if (!usuarioExiste.ativo) {
        if (Number(usuarioExiste.perfil_id) !== Number(perfil_id)) {
          return res.status(409).json({
            mensagem: "Esse usuário já existe.",
          });
        }

        // NOVO (Firebase): como o desativarUsuario desativa a conta no Firebase,
        // ao reativar é preciso reativá-la (com a senha informada agora).
        // Se a conta não existir no Firebase, cria.
        try {
          try {
            const usuarioFirebase = await admin.auth().getUserByEmail(email);

            await admin.auth().updateUser(usuarioFirebase.uid, {
              disabled: false,
              password: senha,
              displayName: nome,
            });
          } catch (erroBusca) {
            if (erroBusca.code !== "auth/user-not-found") throw erroBusca;

            await admin.auth().createUser({
              email,
              password: senha,
              displayName: nome,
            });
          }
        } catch (erroFirebase) {
          if (
            erroFirebase.code === "auth/invalid-password" ||
            erroFirebase.code === "auth/weak-password"
          ) {
            return res.status(400).json({
              mensagem: "A senha deve ter pelo menos 6 caracteres.",
            });
          }

          console.error(
            "Erro ao reativar usuário no Firebase:",
            erroFirebase.message,
          );
          return res.status(502).json({
            mensagem: "Erro ao reativar o acesso do usuário. Tente novamente.",
          });
        }

        await usuarioModel.alterarStatus(usuarioExiste.id, 1);
        return res.status(200).json({
          mensagem: "Colaborador reativado com sucesso.",
          id: usuarioExiste.id,
          nome: usuarioExiste.nome,
          reativado: true,
        });
      }

      return res.status(409).json({
        mensagem: "Esse usuário já existe.",
      });
    }

    // NOVO (Firebase): cria a conta no Firebase (é ela que permite recuperar a senha por e-mail)
    try {
      const usuarioFirebase = await admin.auth().createUser({
        email,
        password: senha,
        displayName: nome,
      });
      firebaseUid = usuarioFirebase.uid;
    } catch (erroFirebase) {
      if (erroFirebase.code === "auth/email-already-exists") {
        return res.status(409).json({
          mensagem: "Esse e-mail já está cadastrado no sistema de acesso.",
        });
      }

      if (
        erroFirebase.code === "auth/invalid-password" ||
        erroFirebase.code === "auth/weak-password"
      ) {
        return res.status(400).json({
          mensagem: "A senha deve ter pelo menos 6 caracteres.",
        });
      }

      if (erroFirebase.code === "auth/invalid-email") {
        return res.status(400).json({ mensagem: "E-mail inválido." });
      }

      console.error("Erro ao criar usuário no Firebase:", erroFirebase.message);
      return res.status(502).json({
        mensagem: "Erro ao criar o acesso do usuário. Tente novamente.",
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
      // NOVO (Firebase): desfaz no Firebase para não ficar conta órfã
      await admin.auth().deleteUser(firebaseUid).catch(() => {});
      return res.status(400).json({
        mensagem: "Não foi possível cadastrar o usuário.",
      });
    }

    salvoNoBanco = true;

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      id: idUsuario,
      nome,
      reativado: false,
    });
  } catch (erro) {
    console.log("Erro no cadastro:", erro.message);

    // NOVO (Firebase): se o erro veio depois de criar no Firebase, desfaz
    if (firebaseUid && !salvoNoBanco) {
      await admin.auth().deleteUser(firebaseUid).catch(() => {});
    }

    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Esse usuário já existe.",
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível cadastrar o usuário.",
    });
  }
};

// O e-mail e a senha são conferidos pelo Firebase (no front).
// O front manda o idToken e este controller devolve o JWT/sessão de sempre.
const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    let tokenFirebase;
    try {
      tokenFirebase = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({
        mensagem: "Usuário ou senha incorretos.",
      });
    }

    const usuario = await usuarioModel.getUsuarioLogin(tokenFirebase.email);

    if (!usuario) {
      return res.status(404).json({
        mensagem: "Usuário ou senha incorretos.",
      });
    }

    if (!usuario.ativo) {
      return res.status(403).json({
        mensagem: "Usuário desativado. Entre em contato com o administrador.",
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
      mensagem: "Não foi possível realizar o acesso.",
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
      mensagem: "Não foi possível encerrar a sessão.",
    });
  }
};

const putUsuario = async (req, res) => {
  // NOVO (Firebase): guarda o e-mail antigo para desfazer no Firebase se o MySQL falhar
  let emailAlteradoNoFirebase = null;

  const desfazerEmailNoFirebase = async () => {
    if (!emailAlteradoNoFirebase) return;
    await admin
      .auth()
      .updateUser(emailAlteradoNoFirebase.uid, {
        email: emailAlteradoNoFirebase.emailAntigo,
      })
      .catch((e) =>
        console.error(
          "Não foi possível desfazer o e-mail no Firebase:",
          e.message,
        ),
      );
  };

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

    // NOVO (Firebase): mantém e-mail/senha do Firebase iguais aos do sistema
    const mudouEmail = email && email !== usuarioExiste.email;

    if (senha || mudouEmail) {
      try {
        const usuarioFirebase = await admin
          .auth()
          .getUserByEmail(usuarioExiste.email);

        await admin.auth().updateUser(usuarioFirebase.uid, {
          ...(senha && { password: senha }),
          ...(mudouEmail && { email }),
        });

        if (mudouEmail) {
          emailAlteradoNoFirebase = {
            uid: usuarioFirebase.uid,
            emailAntigo: usuarioExiste.email,
          };
        }
      } catch (erroFirebase) {
        if (erroFirebase.code === "auth/email-already-exists") {
          return res.status(409).json({
            mensagem: "Esse e-mail já está em uso.",
          });
        }

        if (
          erroFirebase.code === "auth/invalid-password" ||
          erroFirebase.code === "auth/weak-password"
        ) {
          return res.status(400).json({
            mensagem: "A senha deve ter pelo menos 6 caracteres.",
          });
        }

        if (erroFirebase.code === "auth/invalid-email") {
          return res.status(400).json({ mensagem: "E-mail inválido." });
        }

        console.error("Erro ao atualizar no Firebase:", erroFirebase.message);
        return res.status(502).json({
          mensagem: "Não foi possível atualizar o acesso do usuário.",
        });
      }
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
      await desfazerEmailNoFirebase(); // NOVO (Firebase)
      return res.status(400).json({
        mensagem: "Não foi possível atualizar o usuário.",
      });
    }

    return res.status(200).json({
      mensagem: "Usuário atualizado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no update:", erro.message);
    await desfazerEmailNoFirebase(); // NOVO (Firebase)
    return res.status(500).json({
      mensagem: "Não foi possível atualizar o usuário.",
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

    // NOVO (Firebase): desativa a conta no Firebase e derruba as sessões abertas.
    // Ao reativar (pelo cadastro), a conta é reativada lá em cima.
    // Se falhar, só registra no log: o login já barra por usuario.ativo.
    try {
      const usuarioFirebase = await admin
        .auth()
        .getUserByEmail(usuarioExiste.email);

      await admin.auth().updateUser(usuarioFirebase.uid, { disabled: true });
      await admin.auth().revokeRefreshTokens(usuarioFirebase.uid);
    } catch (erroFirebase) {
      console.error(
        "Erro ao desativar usuário no Firebase:",
        erroFirebase.message,
      );
    }

    return res.status(200).json({
      mensagem: "Status do usuário alterado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no alterar status:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível alterar o status do usuário.",
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
