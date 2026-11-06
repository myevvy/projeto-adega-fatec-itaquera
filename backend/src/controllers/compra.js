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
    const { data, subtotal, total, frete } = req.body;

    const dataUsuario = dayjs(data);

    if (!dataUsuario.isValid()) {
      return res.status(400).json({ mensagem: "Data inválida." });
    }

    if (!data || subtotal == null || total == null || frete == null) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios.",
      });
    }

    const existeCompra = await comprasModel.getCompra(data, total);

    if (existeCompra) {
      return res.status(409).json({
        mensagem: "Essa compra já está cadastrado.",
      });
    }
    const compra = await comprasModel.postCompra(req.body);

    return res.status(201).json({
      mensagem: "Compra cadastrada com sucesso!",
      compra,
    });
  } catch (erro) {
    console.log("Erro no post compra:", erro.message);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar compra.",
    });
  }
};

const cancelarCompra = async (req, res) => {
  try {
    const { id: idCompra } = req.params;

    const compra = await comprasModel.getCompraID(idCompra);

    if (!compra || compra.status === "CANCELADA") {
      return res.status(404).json({
        mensagem: "Compra não encontrada.",
      });
    }

    const linhasAfetadas = await comprasModel.cancelarCompra(idCompra);

    if (!linhasAfetadas) {
      return res.status(404).json({
        mensagem: "Erro ao cancelar compra.",
      });
    }

    return res.status(200).json({
      mensagem: "Compra cancelada com sucesso!",
    });
  } catch (erro) {
    console.log("Erro no cancelar compra:", erro.message);

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
