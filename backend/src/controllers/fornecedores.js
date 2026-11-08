import fornecedoresModels from "../models/estoque/fornecedores.js";

const getFornecedores = async (req, res) => {
  try {
    const { nome } = req.params;
    const fornecedores = await fornecedoresModels.getFornecedores(nome);

    return res.status(200).json(fornecedores);
  } catch (erro) {
    console.error("Erro ao buscar fornecedores:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar fornecedores... Comunique-nos sobre o ocorrido",
    });
  }
};

const postFornecedores = async (req, res) => {
  try {
    const { nome, telefone } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    const existeFornecedores = await fornecedoresModels.getFornecedores(nome);

    if (existeFornecedores) {
      return res.status(409).json({
        mensagem: "Esse fornecedor já está cadastrado.",
      });
    }

    const fornecedor = await fornecedoresModels.postFornecedor(req.body);

    return res.status(201).json({
      mensagem: "Fornecedor cadastrado com sucesso!",
      fornecedor,
    });
  } catch (erro) {
    console.log("Erro no post fornecedores:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar fornecedor.",
    });
  }
};

const putFornecedor = async (req, res) => {
  try {
    const { id: idFornecedor } = req.params;

    const fornecedor = await fornecedoresModels.getFornecedorID(idFornecedor);

    if (!fornecedor || !fornecedor.ativo) {
      return res.status(404).json({
        mensagem: "Fornecedor não encontrado.",
      });
    }

    const dados = req.body;

    const linhasAfetadas = await fornecedoresModels.putFornecedor(
      idFornecedor,
      dados,
    );

    if (!linhasAfetadas)
      return res.status(404).json({ mensagem: "Nenhuma alteração feita." });

    return res.status(200).json({
      mensagem: "Fornecedor alterado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no put fornecedor:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao atualizar fornecedor... Comunique-nos sobre o ocorrido",
    });
  }
};

const deleteFornecedor = async (req, res) => {
  try {
    const { id: idFornecedor } = req.params;

    const fornecedor = await fornecedoresModels.getFornecedorID(idFornecedor);

    if (!fornecedor || !fornecedor.ativo) {
      return res.status(404).json({
        mensagem: "Fornecedor não encontrado.",
      });
    }

    const linhasAfetadas =
      await fornecedoresModels.deleteFornecedor(idFornecedor);

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Erro ao deletar fornecedor.",
      });
    }

    return res.status(200).json({
      mensagem: "Fornecedor deletado com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no delete fornecedor:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao deletar fornecedor.",
    });
  }
};

export default {
  getFornecedores,
  postFornecedores,
  putFornecedor,
  deleteFornecedor,
};
