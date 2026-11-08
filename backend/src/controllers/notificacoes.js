const getNotificacoes = async (req, res) => {
  try {
    const lista = await notificacoesModel.getNotificacoesUsuario(req.usuario.id);
    res.json(lista);
  } catch (erro) {
    console.error("Erro ao buscar notificações:", erro);
    res.status(500).json({ mensagem: "Erro interno ao buscar notificações." });
  }
};

const getTotalNaoLidas = async (req, res) => {
  try {
    const total = await notificacoesModel.contarNaoLidas(req.usuario.id);
    res.json({ total });
  } catch (erro) {
    console.error("Erro ao contar notificações:", erro);
    res.status(500).json({ mensagem: "Erro interno ao contar notificações." });
  }
};

const marcarComoLida = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ mensagem: "ID da notificação inválido." });
    }
    const linhas = await notificacoesModel.marcarComoLida(id, req.usuario.id);
    if (!linhas) {
      return res.status(404).json({ mensagem: "Notificação não encontrada." });
    }
    res.json({ mensagem: "Notificação marcada como lida." });
  } catch (erro) {
    console.error("Erro ao marcar notificação:", erro);
    res.status(500).json({ mensagem: "Erro interno ao marcar notificação." });
  }
};

export default {
  getNotificacoes,
  getTotalNaoLidas,
  marcarComoLida,
};