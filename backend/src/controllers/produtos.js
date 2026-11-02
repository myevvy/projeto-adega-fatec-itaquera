import produtosModels from "../models/produtos.js";

const getProdutos = async (_req, res) => {
  try {
    const produtos = await produtosModels.getProdutos();

    return res.status(200).json(produtos);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar produtos... Comunique-nos sobre o ocorrido",
    });
  }
};

const postProdutos = async (req, res) => {
  try {
    const { nome, categoria, precoV, custo, estoque, qntMinima, desc } =
      req.body;

    if (
      !nome ||
      !categoria ||
      precoV == null ||
      custo == null ||
      estoque == null ||
      qntMinima == null
    ) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    if (
      Number(precoV) < 0 ||
      Number(custo) < 0 ||
      Number(estoque) < 0 ||
      Number(qntMinima) < 0 ||
      !Number.isFinite(Number(precoV)) ||
      !Number.isFinite(Number(custo)) ||
      !Number.isFinite(Number(estoque)) ||
      !Number.isFinite(Number(qntMinima))
    ) {
      return res.status(400).json({
        mensagem: "Informe valores numéricos válidos e não negativos.",
      });
    }

    const existeProduto = await produtosModels.getProdutos(nome, categoria, precoV);

    if (existeProduto) {
      return res.status(409).json({
        mensagem: "Esse produto já está cadastrado.",
      });
    }

    const produto = await produtosModels.postProdutos({
      nome,
      categoria,
      precoV,
      custo,
      estoque,
      qntMinima,
      desc,
    });

    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto,
    });
  } catch (erro) {
    console.log("Erro no post produto:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao cadastrar produto... Comunique-nos sobre o ocorrido",
    });
  }
};

const putProdutos = async (req, res) => {
  try {
    const { id: idProduto } = req.params;

    const produto = await produtosModels.getProdutos(idProduto);

    if (!produto || !produto.ativo) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const dados = req.body;

    await produtosModels.putProdutos(idProduto, dados);

    return res.status(200).json({
      mensagem: "Produto alterado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no put produto:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao atualizar produto... Comunique-nos sobre o ocorrido",
    });
  }
};

const deleteProdutos = async (req, res) => {
  try {
    const { id: idProduto } = req.params;

    const produto = await produtosModels.getProdutos(idProduto);

    if (!produto || !produto.ativo) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const linhasAfetadas = await produtosModels.deleteProdutos(idProduto);

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Erro ao deletar produto.",
      });
    }

    return res.status(200).json({
      mensagem: "Produto deletado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no delete produto:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao deletar produto.",
    });
  }
};

export default {
  getProdutos,
  postProdutos,
  putProdutos,
  deleteProdutos,
};
