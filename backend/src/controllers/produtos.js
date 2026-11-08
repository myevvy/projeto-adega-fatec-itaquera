import produtosModels from "../models/estoque/produtos.js";

const getProdutos = async (req, res) => {
  try {
    const { filtro } = req.params;
    const produtos = await produtosModels.getProdutos(filtro);

    if (produtos === null) {
      return res.status(404).json({ mensagem: "Produto não encontrado." });
    }

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

    if (!req.file) {
      return res.status(400).json({
        mensagem: "Envie uma imagem para o produto.",
      });
    }

    const imagem = `/uploads/produtos/${req.file.filename}`;

    const existeProduto = await produtosModels.getProdutos(nome);

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
      imagem,
    });

    return res.status(201).json({
      mensagem: "Produto cadastrado com sucesso!",
      produto,
    });
  } catch (erro) {
    console.log("Erro no post produto:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar produto.",
    });
  }
};

const putProdutos = async (req, res) => {
  try {
    const { id: idProduto } = req.params;
    const { id } = req.usuario;

    const produto = await produtosModels.getProdutos(idProduto);

    if (!produto || !produto.ativo) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const dados = req.body;

    await produtosModels.putProdutos(idProduto, dados, id);

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
    const { id } = req.usuario;

    const produto = await produtosModels.getProdutosID(idProduto);

    if (!produto || !produto.ativo) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const linhasAfetadas = await produtosModels.deleteProdutos(idProduto, id);

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

const reativarProduto = async (req, res) => {
  try {
    const { id: idProduto } = req.params;

    const produto = await produtosModels.getProdutosID(idProduto);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const linhasAfetadas = await produtosModels.deleteProdutos(idProduto);

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Erro ao reativar produto.",
      });
    }

    return res.status(200).json({
      mensagem: "Produto reativado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no reativar produto:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao reativar produto.",
    });
  }
};

const getProdutosInativos = async (_req, res) => {
  try {
    const produtos = await produtosModels.getProdutosInativos();

    return res.status(200).json(produtos);
  } catch (erro) {
    console.error("Erro ao buscar produtos inativos:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar produtos inativos... Comunique-nos sobre o ocorrido",
    });
  }
};

const getHistoricoPreco = async (req, res) => {
  try {
    const { id: idProduto } = req.params;
    const produtos = await produtosModels.getHistoricoPreco(idProduto);

    return res.status(200).json(produtos);
  } catch (erro) {
    console.error("Erro ao buscar historico de preços:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar histórico de preços... Comunique-nos sobre o ocorrido",
    });
  }
};

const getEstoqueAlertas = async (_req, res) => {
  try {
    const produtosA = await produtosModels.getEstoqueAlertas();

    return res.status(200).json(produtosA);
  } catch (erro) {
    console.error("Erro ao buscar produtos em alerta:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar produtos em alerta... Comunique-nos sobre o ocorrido",
    });
  }
};

export default {
  getProdutos,
  postProdutos,
  putProdutos,
  deleteProdutos,
  reativarProduto,
  getProdutosInativos,
  getHistoricoPreco,
  getEstoqueAlertas
};
