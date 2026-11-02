import jwt from "jsonwebtoken";
import usuario from "../models/usuarios.js";
import usuarios from "../controllers/usuarios.js";

const verificaToken = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      mensagem: "Token não informado!",
    });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      mensagem: "Token inválido!",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.ASSINATURA_TOKEN);

    const usuario = await usuarios.getUsuario;

    if (!usuario || usuario.status !== "ativo") {
      return res.status(401).json({
        mensagem: "Conta desativada ou inexistente.",
      });
    }

    req.usuario = { id: usuario.id, tipo: usuario.tipo };

    next();
  } catch (error) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado.",
    });
  }
};
