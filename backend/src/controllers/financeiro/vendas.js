import vendasModel from "../../models/comercial/vendas.js";
import dayjs from "dayjs";

const getVendas = async (_req, res) => {
  try {
    const vendas = await vendasModel.getVendas();

    return res.status(200).json(vendas);
  } catch (erro) {
    console.error("Erro ao buscar vendas:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar vendas... Comunique-nos sobre o ocorrido",
    });
  }
};

const getVendasUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogado = req.usuario;

    if (!usuarioLogado?.id) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const idUsuario = Number(id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: "ID do usuário inválido.",
      });
    }

    const vendas = await vendasModel.getVendasUsuario(idUsuario);

    return res.status(200).json(vendas);
  } catch (erro) {
    console.error("Erro ao buscar vendas do usuário:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar vendas do usuário.",
    });
  }
};

const postVendas = async (req, res) => {
  try {
    const { data, subtotal, desconto, total, frete, itens } = req.body ?? {};

    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    if (
      !data ||
      subtotal == null ||
      desconto == null ||
      total == null ||
      frete == null ||
      !Array.isArray(itens) ||
      itens.length === 0
    ) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    if (!dayjs(data).isValid()) {
      return res.status(400).json({
        mensagem: "Data inválida.",
      });
    }

    const venda = await vendasModel.postVenda(req.body, usuarioId);

    return res.status(201).json({
      mensagem: "Venda cadastrada com sucesso!",
      venda,
    });
  } catch (erro) {
    console.error("Erro no post venda:", erro);

    if (erro.code && erro.errno === undefined) {
      return res.status(400).json({
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar venda.",
    });
  }
};

const cancelarVenda = async (req, res) => {
  try {
    const { id: idVenda } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    if (!Number.isInteger(Number(idVenda)) || Number(idVenda) <= 0) {
      return res.status(400).json({
        mensagem: "ID da venda inválido.",
      });
    }

    const linhasAfetadas = await vendasModel.cancelarVenda(
      Number(idVenda),
      usuarioId,
    );

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Venda não encontrada ou já cancelada.",
      });
    }

    return res.status(200).json({
      mensagem: "Venda cancelada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro no cancelar venda:", erro);

    if (erro.code && erro.errno === undefined) {
      return res.status(400).json({
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao cancelar venda.",
    });
  }
};

export default {
  getVendas,
  getVendasUsuario,
  postVendas,
  cancelarVenda,
};
