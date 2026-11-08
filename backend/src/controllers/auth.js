import jwt from "jsonwebtoken";
import crypto from "crypto";
import sessaoModel from "../models/auth/sessoes.js";

const sha256 = (valor) =>
  crypto.createHash("sha256").update(valor).digest("hex");

const autenticar = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ mensagem: "Token não informado!" });
    }

    const [esquema, token] = header.split(" ");

    if (esquema !== "Bearer" || !token) {
      return res.status(401).json({ mensagem: "Token inválido!" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.ASSINATURA_TOKEN);
    } catch {
      return res.status(401).json({ mensagem: "Token inválido ou expirado." });
    }

    const tokenHash = sha256(token);
    const sessao = await sessaoModel.buscarSessaoAtiva(tokenHash);

    if (!sessao) {
      return res
        .status(401)
        .json({ mensagem: "Sessão encerrada ou inválida." });
    }

    req.usuario = { id: payload.id, perfil: payload.perfil };
    req.tokenHash = tokenHash;
    next();
  } catch (erro) {
    console.error("Erro na autenticação:", erro.message);
    return res.status(500).json({ mensagem: "Erro interno na autenticação" });
  }
};

const autorizar =
  (...perfis) =>
  (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      return res.status(403).json({ mensagem: "Sem permissão." });
    }
    next();
  };

export default { autenticar, autorizar };