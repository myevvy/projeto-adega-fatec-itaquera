import sessaoModel from "../models/sessoes.js";

const autenticar = async (req, res, next) => {
  try {
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
    console.log("Erro na autenticação: ", erro.message);
    return res.status(500).json({ mensagem: "Erro interno na autenticação" });
  }
};

export default { autenticar };
