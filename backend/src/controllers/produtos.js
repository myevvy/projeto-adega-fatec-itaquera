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
        "Não foi possível carregar os produtos.",
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

    if (erro.code === "CATEGORIA_INVALIDA") {
      return res.status(400).json({
        mensagem:
          "Categoria inválida. Informe um ID ou nome de uma categoria existente e ativa.",
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível cadastrar o produto.",
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

    const atualizado = await produtosModels.putProdutos(idProduto, dados, id);

    if (!atualizado) {
      return res.status(400).json({
        mensagem: "Nenhum campo válido para atualização foi informado.",
      });
    }

    return res.status(200).json({
      mensagem: "Produto alterado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no put produto:", erro.message);

    return res.status(500).json({
      mensagem:
        "Não foi possível atualizar o produto.",
    });
  }
};

const alterarQuantidade = async (req, res) => {
  try {
    const { quantidade, tipo, quantidadeMovimentada, motivo, observacao } = req.body;
    const { id } = req.params;
    const { id: usuario_id } = req.usuario;

    const novaMovimentacao =
      tipo !== undefined || quantidadeMovimentada !== undefined;

    if (novaMovimentacao) {
      if (
        !["entrada", "saida", "ajuste"].includes(tipo) ||
        !Number.isSafeInteger(quantidadeMovimentada) ||
        ((tipo === "entrada" || tipo === "saida") &&
          quantidadeMovimentada <= 0)
      ) {
        return res.status(400).json({
          mensagem:
            "Informe uma entrada, saída ou ajuste e uma quantidade inteira válida.",
        });
      }
    } else if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
      return res.status(400).json({
        mensagem:
          "A quantidade deve ser um número inteiro maior ou igual a zero.",
      });
    }

    const saldoAtualizado = await produtosModels.alterarQuantidade(
      id,
      { quantidade, tipo, quantidadeMovimentada, motivo, observacao },
      usuario_id,
    );

    if (saldoAtualizado === null) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    return res.status(200).json({
      mensagem: "Quantidade alterada com sucesso!",
      quantidade: saldoAtualizado,
    });
  } catch (erro) {
    console.error("Erro ao alterar quantidade:", erro);

    if (erro.code === "QUANTIDADE_INVALIDA") {
      return res.status(400).json({ mensagem: erro.message });
    }

    return res.status(500).json({
      mensagem: "Não foi possível atualizar a quantidade.",
    });
  }
};
const deleteProdutos = async (req, res) => {
  try {
    const { id: idProduto } = req.params;
    const { id } = req.usuario;

    const produto = await produtosModels.getProdutos(idProduto);

    if (!produto || !produto.ativo) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    const linhasAfetadas = await produtosModels.deleteProdutos(idProduto, id);

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Não foi possível excluir o produto.",
      });
    }

    return res.status(200).json({
      mensagem: "Produto deletado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no delete produto:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível excluir o produto.",
    });
  }
};

const reativarProduto = async (req, res) => {
  try {
    const { id: idProduto } = req.params;

    const produto = await produtosModels.getProdutos(idProduto);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    if (produto.ativo) {
      return res.status(409).json({ mensagem: "O produto já está ativo." });
    }

    const linhasAfetadas = await produtosModels.reativarProduto(idProduto);

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Não foi possível reativar o produto.",
      });
    }

    return res.status(200).json({
      mensagem: "Produto reativado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no reativar produto:", erro.message);

    return res.status(500).json({
      mensagem: "Não foi possível reativar o produto.",
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
        "Não foi possível carregar os produtos indisponíveis.",
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
        "Não foi possível carregar o histórico de preços.",
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
        "Não foi possível carregar os alertas de estoque.",
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
  getEstoqueAlertas,
  alterarQuantidade,
};
