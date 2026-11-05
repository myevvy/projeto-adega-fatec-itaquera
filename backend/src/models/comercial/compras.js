import db from "../../../config/db.js";
import dayjs from "dayjs";

const SELECT_BASE = `
  SELECT c.id, c.fornecedor_id, f.nome AS fornecedor, c.usuario_id,
         DATE_FORMAT(c.data, '%Y-%m-%d') AS data, c.registrada_em,
         c.forma_pagamento, c.prazo_dias,
         c.subtotal, c.frete_impostos AS frete, c.valor_total AS total,
         c.status, c.cancelada_em
    FROM compra c
    JOIN fornecedor f ON f.id = c.fornecedor_id`;

const erroNegocio = (code, mensagem) => Object.assign(new Error(mensagem), { code });
const centavos = (n) => Math.round(Number(n) * 100);
const reais = (c) => (c / 100).toFixed(2);
const soData = (d) =>
  /^\d{4}-\d{2}-\d{2}/.test(String(d)) ? String(d).slice(0, 10) : dayjs(d).format("YYYY-MM-DD");

const getCompras = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY c.data DESC, c.id DESC`);
  return rows;
};

const getComprasFornecedor = async (idFornecedor) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE c.fornecedor_id = ? ORDER BY c.data DESC, c.id DESC`,
    [idFornecedor],
  );
  return rows;
};

// Usado pelo controller para checar duplicado (mesma data e mesmo total)
const getCompra = async (data, total) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE c.data = ? AND c.valor_total = ? AND c.status <> 'CANCELADA' LIMIT 1`,
    [soData(data), total],
  );
  return rows[0] || null;
};

// Compra + itens
const getCompraID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE c.id = ?`, [id]);
  if (rows.length === 0) return null;

  const [itens] = await db.query(
    `SELECT ic.id, ic.produto_id, p.nome AS produto, ic.quantidade,
            ic.custo_aquisicao AS custo, ic.subtotal
       FROM item_compra ic
       JOIN produto p ON p.id = ic.produto_id
      WHERE ic.compra_id = ?`,
    [id],
  );
  return { ...rows[0], itens };
};

/*
  Campos aceitos no body:
    fornecedor (ou fornecedor_id), data, frete, subtotal, total,
    forma_pagamento (DINHEIRO | PIX | CARTAO | BOLETO), prazo_dias (só com BOLETO),
    itens: [{ produto (ou produto_id), quantidade, custo }]
  O usuário logado vem no 2º argumento (ou em dados.usuario_id).
*/
const postCompra = async (dados, usuario_id = null) => {
  const usuario = usuario_id ?? dados.usuario_id;
  const fornecedor_id = dados.fornecedor_id ?? dados.fornecedor;

  if (!usuario) throw erroNegocio("USUARIO_OBRIGATORIO", "Usuário da compra não informado.");
  if (!fornecedor_id) throw erroNegocio("FORNECEDOR_INVALIDO", "Fornecedor não informado.");

  const itens = (dados.itens ?? []).map((i) => ({
    produto_id: Number(i.produto_id ?? i.produto),
    quantidade: Number(i.quantidade),
    custo: centavos(i.custo ?? i.custo_aquisicao),
  }));

  for (const i of itens) {
    const ok =
      Number.isInteger(i.produto_id) &&
      Number.isInteger(i.quantidade) && i.quantidade > 0 &&
      Number.isFinite(i.custo) && i.custo >= 0;
    if (!ok) throw erroNegocio("ITEM_INVALIDO", "Item de compra inválido.");
  }
  if (new Set(itens.map((i) => i.produto_id)).size !== itens.length) {
    throw erroNegocio("ITEM_DUPLICADO", "O mesmo produto aparece mais de uma vez na compra.");
  }

  // Contas em centavos (evita erro de arredondamento do JavaScript)
  const freteC = centavos(dados.frete);
  const subtotalC =
    itens.length > 0
      ? itens.reduce((soma, i) => soma + i.quantidade * i.custo, 0)
      : centavos(dados.subtotal);

  if (itens.length > 0 && centavos(dados.subtotal) !== subtotalC) {
    throw erroNegocio("SUBTOTAL_INCONSISTENTE", "O subtotal não bate com a soma dos itens.");
  }
  const totalC = subtotalC + freteC;
  if (dados.total != null && centavos(dados.total) !== totalC) {
    throw erroNegocio("TOTAL_INCONSISTENTE", "O total não bate com subtotal + frete.");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [forn] = await conn.query(
      "SELECT id FROM fornecedor WHERE id = ? AND ativo = TRUE",
      [fornecedor_id],
    );
    if (forn.length === 0) {
      throw erroNegocio("FORNECEDOR_INVALIDO", "Fornecedor não encontrado ou inativo.");
    }

    const [compra] = await conn.query(
      `INSERT INTO compra
         (fornecedor_id, usuario_id, data, forma_pagamento, prazo_dias,
          subtotal, frete_impostos, valor_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fornecedor_id, usuario, soData(dados.data),
        dados.forma_pagamento ?? null, dados.prazo_dias ?? null,
        reais(subtotalC), reais(freteC), reais(totalC),
      ],
    );
    const compraId = compra.insertId;

    for (const item of itens) {
      const [prod] = await conn.query(
        "SELECT quantidade_estoque FROM produto WHERE id = ? AND ativo = TRUE FOR UPDATE",
        [item.produto_id],
      );
      if (prod.length === 0) {
        throw erroNegocio("PRODUTO_INVALIDO", `Produto ${item.produto_id} não encontrado ou inativo.`);
      }
      const saldo = prod[0].quantidade_estoque + item.quantidade;

      await conn.query(
        `INSERT INTO item_compra (compra_id, produto_id, quantidade, custo_aquisicao, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [compraId, item.produto_id, item.quantidade, reais(item.custo), reais(item.quantidade * item.custo)],
      );

      await conn.query("UPDATE produto SET quantidade_estoque = ? WHERE id = ?", [
        saldo,
        item.produto_id,
      ]);

      await conn.query(
        `INSERT INTO movimentacao_estoque
           (produto_id, usuario_id, tipo, quantidade, saldo_apos,
            fornecedor_id, custo_unitario, compra_id)
         VALUES (?, ?, 'COMPRA', ?, ?, ?, ?, ?)`,
        [item.produto_id, usuario, item.quantidade, saldo, fornecedor_id, reais(item.custo), compraId],
      );
    }

    await conn.commit();
    return getCompraID(compraId);
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
};

// Devolve 1 se cancelou, 0 se a compra não existe ou já estava cancelada
const cancelarCompra = async (id, usuario_id = null) => {
  if (!usuario_id) {
    throw erroNegocio("USUARIO_OBRIGATORIO", "Usuário que cancela a compra não informado.");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [compras] = await conn.query(
      "SELECT status, fornecedor_id FROM compra WHERE id = ? FOR UPDATE",
      [id],
    );
    if (compras.length === 0 || compras[0].status === "CANCELADA") {
      await conn.rollback();
      return 0;
    }

    const [itens] = await conn.query(
      "SELECT produto_id, quantidade, custo_aquisicao FROM item_compra WHERE compra_id = ?",
      [id],
    );

    for (const item of itens) {
      const [prod] = await conn.query(
        "SELECT quantidade_estoque FROM produto WHERE id = ? FOR UPDATE",
        [item.produto_id],
      );
      const saldo = prod[0].quantidade_estoque - item.quantidade;
      if (saldo < 0) {
        throw erroNegocio(
          "ESTOQUE_INSUFICIENTE",
          "Não dá para cancelar: parte dessa compra já saiu do estoque.",
        );
      }

      await conn.query("UPDATE produto SET quantidade_estoque = ? WHERE id = ?", [
        saldo,
        item.produto_id,
      ]);

      await conn.query(
        `INSERT INTO movimentacao_estoque
           (produto_id, usuario_id, tipo, quantidade, saldo_apos,
            fornecedor_id, custo_unitario, compra_id)
         VALUES (?, ?, 'REVERSAO_COMPRA', ?, ?, ?, ?, ?)`,
        [item.produto_id, usuario_id, -item.quantidade, saldo, compras[0].fornecedor_id, item.custo_aquisicao, id],
      );
    }

    await conn.query(
      "UPDATE compra SET status = 'CANCELADA', cancelada_por = ?, cancelada_em = NOW() WHERE id = ?",
      [usuario_id, id],
    );

    await conn.commit();
    return 1;
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
};

export default {
  getCompras,
  getComprasFornecedor,
  getCompra,
  getCompraID,
  postCompra,
  cancelarCompra,
};