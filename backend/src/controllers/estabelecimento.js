import estabelecimentoModel from "../models/estabelecimento.js";

const getEstabelecimento = async (_req, res) => {
  try {
    const estabelecimento = await estabelecimentoModel.getEstabelecimento();
    return res.status(200).json({ estabelecimento });
  } catch (erro) {
    console.error("Erro ao buscar dados do estabelecimento:", erro.message);
    return res.status(500).json({
      mensagem: "Erro interno ao recuperar os dados do estabelecimento.",
    });
  }
};

const putEstabelecimento = async (req, res) => {
  try {
    const {
      nome_estabelecimento,
      categoria_estabelecimento,
      telefone_comercial,
    } = req.body ?? {};

    if (
      typeof nome_estabelecimento !== "string" ||
      !nome_estabelecimento.trim() ||
      nome_estabelecimento.trim().length > 120 ||
      typeof categoria_estabelecimento !== "string" ||
      !categoria_estabelecimento.trim() ||
      categoria_estabelecimento.trim().length > 80 ||
      typeof telefone_comercial !== "string" ||
      telefone_comercial.length > 20
    ) {
      return res.status(400).json({
        mensagem:
          "Informe nome, categoria e telefone válidos para o estabelecimento.",
      });
    }

    const estabelecimento = await estabelecimentoModel.saveEstabelecimento({
      nome_estabelecimento: nome_estabelecimento.trim(),
      categoria_estabelecimento: categoria_estabelecimento.trim(),
      telefone_comercial: telefone_comercial.trim(),
    });
    return res.status(200).json({ estabelecimento });
  } catch (erro) {
    console.error("Erro ao salvar dados do estabelecimento:", erro.message);
    return res.status(500).json({
      mensagem: "Erro interno ao salvar os dados do estabelecimento.",
    });
  }
};

export default { getEstabelecimento, putEstabelecimento };
