import relatoriosModel from "../../models/estoque/relatorios.js";

const getRelatorioEstoque = async (_req, res) => {
  try {
    const relatorio = await relatoriosModel.obterRelatorioEstoque();

    return res.status(200).json(relatorio);
  } catch (erro) {
    console.error("Erro ao gerar relatório de estoque:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao gerar relatório de estoque.",
    });
  }
};

export default { getRelatorioEstoque };
