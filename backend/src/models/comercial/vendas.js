import db from "../../../config/db.js";
import dayjs from "dayjs";

const SELECT_BASE = `
  SELECT v.id, v.usuario_id, u.nome AS vendedor,
         DATE_FORMAT(v.data_hora, '%Y-%m-%d %H:%i:%s') AS data_hora,
         v.subtotal, v.desconto, v.valor_total AS total,
         v.forma_pagamento, v.tipo_cartao, v.status,
         v.finalizada_em, v.cancelada_em
    FROM venda v
    JOIN usuario u ON u.id = v.usuario_id`;

const erroNegocio = (code, mensagem) => Object.assign(new Error(mensagem), { code });
const centavos = (n) => Math.round(Number(n) * 100);
const reais = (c) => (c / 100).toFixed(2);
const soData = (d) =>
  /^\d{4}-\d{2}-\d{2}/.test(String(d)) ? String(d).slice(0, 10) : dayjs(d).format("YYYY-MM-DD");

const getVendas = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY v.data_hora DESC, v.id DESC`);
  return rows;
};

const getVendasUsuario = async (idUsuario) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE v.usuario_id = ? ORDER BY v.data_hora DESC, v.id DESC`,
    [idUsuario]
  );
  return rows;
};

const getVendaID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE v.id = ?`, [id]);
  if (rows.length === 0) return null;

  const [itens] = await db.query(
    `SELECT iv.id, iv.produto_id, p.nome AS produto, iv.quantidade,
            iv.preco_unitario, iv.custo_unitario, iv.subtotal
       FROM item_venda iv
       JOIN produto p ON p.id = iv.produto_id
      WHERE iv.venda_id = ?`,
    [id]
  );
  return { ...rows[0], itens };
};

const postVenda = async (dados, usuario_id = null) => {
  const usuario = usuario_id ?? dados.usuario_id;
  if (!usuario) throw erroNegocio("USUARIO_OBRIGATORIO", "Usuário da venda não informado.");

  const itens = (dados.itens ?? []).map((i) => ({
    produto_id: Number(i.produto_id ?? i.produto),
    quantidade: Number(i.quantidade),
    preco_unitario: centavos(i.preco_unitario ?? i.preco),
  }));

  for (const i of itens) {
    const ok =
      Number.isInteger(i.produto_id) &&
      Number.isInteger(i.quantidade) && i.quantidade > 0 &&
      Number.isFinite(i.preco_unitario) && i.preco_unitario >= 0;
    if (!ok) throw erroNegocio("ITEM_INVALIDO", "Item de venda inválido.");
  }

  if (new Set(itens.map((i) => i.produto_id)).size !== itens.length) {
    throw erroNegocio("ITEM_DUPLICADO", "O mesmo produto aparece mais de uma vez na venda.");
  }

  const descontoC = centavos(dados.desconto ?? 0);
  const subtotalC = itens.reduce((soma, i) => soma + i.quantidade * i.preco_unitario, 0);

  if (dados.subtotal != null && centavos(dados.subtotal) !== subtotalC) {
    throw erroNegocio("SUBTOTAL_INCONSISTENTE", "O subtotal não bate com a soma dos itens.");
  }

  const totalC = subtotalC - descontoC;
  if (totalC < 0) throw erroNegocio("DESCONTO_INVALIDO", "O desconto não pode ser maior que o subtotal.");
  
  if (dados.total != null && centavos(dados.total) !== totalC) {
    throw erroNegocio("TOTAL_INCONSISTENTE", "O total não bate com subtotal - desconto.");
  }

  const statusVenda = dados.status ?? "CONCLUIDA";
  const formaPagamento = dados.forma_pagamento ?? null;
  const tipoCartao = dados.tipo_cartao ?? null;

  if (statusVenda === "CONCLUIDA" && !formaPagamento) {
    throw erroNegocio("PAGAMENTO_OBRIGATORIO", "Forma de pagamento é obrigatória para vendas concluídas.");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [venda] = await conn.query(
      `INSERT INTO venda
         (usuario_id, subtotal, desconto, valor_total, forma_pagamento, tipo_cartao, status, finalizada_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario,
        reais(subtotalC),
        reais(descontoC),
        reais(totalC),
        formaPagamento,
        tipoCartao,
        statusVenda,
        statusVenda === "CONCLUIDA" ? new Date() : null,
      ]
    );
    const vendaId = venda.insertId;

    for (const item of itens) {
      const [prod] = await conn.query(
        "SELECT quantidade_estoque, custo_aquisicao FROM produto WHERE id = ? AND ativo = TRUE FOR UPDATE",
        [item.produto_id]
      );
      if (prod.length === 0) {
        throw erroNegocio("PRODUTO_INVALIDO", `Produto ${item.produto_id} não encontrado ou inativo.`);
      }

      const estoqueAtual = prod[0].quantidade_estoque;
      const custoUnitario = prod[0].custo_aquisicao;
      const saldo = estoqueAtual - item.quantidade;

      if (saldo < 0 && statusVenda === "CONCLUIDA") {
        throw erroNegocio("ESTOQUE_INSUFICIENTE", `Estoque insuficiente para o produto ${item.produto_id}.`);
      }

      await conn.query(
        `INSERT INTO item_venda (venda_id, produto_id, quantidade, preco_unitario, custo_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [vendaId, item.produto_id, item.quantidade, reais(item.preco_unitario), custoUnitario, reais(item.quantidade * item.preco_unitario)]
      );

      if (statusVenda === "CONCLUIDA") {
        await conn.query("UPDATE produto SET quantidade_estoque = ? WHERE id = ?", [saldo, item.produto_id]);

        await conn.query(
          `INSERT INTO movimentacao_estoque
             (produto_id, usuario_id, tipo, quantidade, saldo_apos, custo_unitario, venda_id)
           VALUES (?, ?, 'SAIDA_VENDA', ?, ?, ?, ?)`,
          [item.produto_id, usuario, -item.quantidade, saldo, custoUnitario, vendaId]
        );
      }
    }

    if (statusVenda === "CONCLUIDA") {
      await conn.query(
        `INSERT INTO entrada_financeira (venda_id, valor) VALUES (?, ?)`,
        [vendaId, reais(totalC)]
      );
    }

    await conn.commit();
    return getVendaID(vendaId);
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
};

const cancelarVenda = async (id, usuario_id = null) => {
  if (!usuario_id) {
    throw erroNegocio("USUARIO_OBRIGATORIO", "Usuário que cancela a venda não informado.");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [vendas] = await conn.query(
      "SELECT status FROM venda WHERE id = ? FOR UPDATE",
      [id]
    );
    if (vendas.length === 0 || vendas[0].status === "CANCELADA") {
      await conn.rollback();
      return 0;
    }

    const [itens] = await conn.query(
      "SELECT produto_id, quantidade, custo_unitario FROM item_venda WHERE venda_id = ?",
      [id]
    );

    if (vendas[0].status === "CONCLUIDA") {
      for (const item of itens) {
        const [prod] = await conn.query(
          "SELECT quantidade_estoque FROM produto WHERE id = ? FOR UPDATE",
          [item.produto_id]
        );
        const saldo = prod[0].quantidade_estoque + item.quantidade;

        await conn.query("UPDATE produto SET quantidade_estoque = ? WHERE id = ?", [saldo, item.produto_id]);

        await conn.query(
          `INSERT INTO movimentacao_estoque
             (produto_id, usuario_id, tipo, quantidade, saldo_apos, custo_unitario, venda_id)
           VALUES (?, ?, 'REVERSAO_CANCELAMENTO', ?, ?, ?, ?)`,
          [item.produto_id, usuario_id, item.quantidade, saldo, item.custo_unitario, id]
        );
      }

      await conn.query(
        "UPDATE entrada_financeira SET estornada = TRUE, estornada_em = NOW() WHERE venda_id = ?",
        [id]
      );
    }

    await conn.query(
      "UPDATE venda SET status = 'CANCELADA', cancelada_por = ?, cancelada_em = NOW() WHERE id = ?",
      [usuario_id, id]
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
  getVendas,
  getVendasUsuario,
  getVendaID,
  postVenda,
  cancelarVenda,
};