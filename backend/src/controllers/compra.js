import fornecedorModel from "../models/estoque/fornecedores.js";
import comprasModel from "../models/comercial/compras.js";
import dayjs from "dayjs";

const getCompras = async (_req, res) => {
  try {
    const compras = await comprasModel.getCompras();

    return res.status(200).json(compras);
  } catch (erro) {
    console.error("Erro ao buscar compras:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar compras... Comunique-nos sobre o ocorrido",
    });
  }
};

const getComprasFornecedor = async (req, res) => {
  try {
    const { id: idFornecedor } = req.params;

    const compras = await comprasModel.getComprasFornecedor(idFornecedor);

    return res.status(200).json(compras);
  } catch (erro) {
    console.error("Erro ao buscar compras do fornecedor:", erro.message);

    return res.status(500).json({
      mensagem:
        "Erro interno ao recuperar compras do fornecedor... Comunique-nos sobre o ocorrido",
    });
  }
};

const postCompra = async (req, res) => {
  try {
    //o front procura e ja retorna o fornecedor_id
    const { fornecedor_id, data, subtotal, total, frete, itens } = req.body;
    
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const fornecedor = await fornecedorModel.getFornecedorID(fornecedor_id);
    if(!fornecedor){
      return res.status(404).json({
        mensagem: "Fornecedor não encontrado.",
      });
    }

    if (
      !(fornecedor ?? fornecedor_id) ||
      !data ||
      subtotal == null ||
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

    const compra = await comprasModel.postCompra(req.body, usuarioId);

    return res.status(201).json({
      mensagem: "Compra cadastrada com sucesso!",
      compra,
    });
  } catch (erro) {
    console.error("Erro no post compra:", erro.message);

    if (erro.code) {
      return res.status(400).json({
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar compra.",
    });
  }
};

const cancelarCompra = async (req, res) => {
  try {
    const { id: idCompra } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const linhasAfetadas = await comprasModel.cancelarCompra(
      idCompra,
      usuarioId,
    );

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Compra não encontrada ou já cancelada.",
      });
    }

    return res.status(200).json({
      mensagem: "Compra cancelada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro no cancelar compra:", erro.message);

    if (erro.code === "ESTOQUE_INSUFICIENTE") {
      return res.status(409).json({
        mensagem: erro.message,
      });
    }

    if (erro.code) {
      return res.status(400).json({
        mensagem: erro.message,
      });
    }

    return res.status(500).json({
      mensagem: "Erro interno ao cancelar compra.",
    });
  }
};

export default {
  getCompras,
  getComprasFornecedor,
  postCompra,
  cancelarCompra,
};
