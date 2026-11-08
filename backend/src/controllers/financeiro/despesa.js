import despesasModel from "../../models/financeiro/despesas.js";
import dayjs from "dayjs";

const getDespesas = async (_req, res) => {
  try {
    const despesas = await despesasModel.getDespesas();

    return res.status(200).json(despesas);
  } catch (erro) {
    console.error("Erro ao buscar despesas:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar despesas... Comunique-nos sobre o ocorrido",
    });
  }
};

const postDespesas = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const { descricao, valor, data } = req.body ?? {};
    const categoria = req.body?.categoria_id ?? req.body?.categoria;

    if (!categoria || !descricao?.trim() || valor == null || !data) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    if (!Number.isFinite(Number(valor)) || Number(valor) <= 0) {
      return res.status(400).json({
        mensagem: "O valor da despesa deve ser maior que zero.",
      });
    }

    if (!dayjs(data).isValid()) {
      return res.status(400).json({
        mensagem: "Data inválida.",
      });
    }

    const despesa = await despesasModel.postDespesa(req.body, usuarioId);

    return res.status(201).json({
      mensagem: "Despesa cadastrada com sucesso!",
      despesa,
    });
  } catch (erro) {
    console.error("Erro no post despesa:", erro);

    if (erro.code && erro.errno === undefined) {
      return res.status(400).json({
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar despesa.",
    });
  }
};

const estornarDespesa = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const idDespesa = Number(id);

    if (!Number.isInteger(idDespesa) || idDespesa <= 0) {
      return res.status(400).json({
        mensagem: "ID da despesa inválido.",
      });
    }

    const despesaAtual = await despesasModel.getDespesaID(idDespesa);

    if (!despesaAtual) {
      return res.status(404).json({
        mensagem: "Despesa não encontrada.",
      });
    }

    if (despesaAtual.estornada) {
      return res.status(409).json({
        mensagem: "Despesa já estornada.",
      });
    }

    const linhasAfetadas = await despesasModel.estornarDespesa(idDespesa);

    if (!linhasAfetadas) {
      return res.status(409).json({
        mensagem: "Despesa já estornada.",
      });
    }

    const despesa = await despesasModel.getDespesaID(idDespesa);

    return res.status(200).json({
      mensagem: "Despesa estornada com sucesso!",
      despesa,
    });
  } catch (erro) {
    console.error("Erro ao estornar despesa:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao estornar despesa.",
    });
  }
};
export default {
  getDespesas,
  postDespesas,
  estornarDespesa,
};
