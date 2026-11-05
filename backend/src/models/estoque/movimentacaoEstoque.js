import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT m.id, m.produto_id, p.nome AS produto,
         m.usuario_id, u.nome AS usuario,
         m.tipo, m.quantidade, m.saldo_apos,
         DATE_FORMAT(m.data_hora, '%Y-%m-%d %H:%i:%s') AS data_hora,
         m.motivo, m.observacao, m.fornecedor_id, f.nome AS fornecedor,
         m.custo_unitario, m.venda_id, m.compra_id
    FROM movimentacao_estoque m
    JOIN produto p ON p.id = m.produto_id
    JOIN usuario u ON u.id = m.usuario_id
    LEFT JOIN fornecedor f ON f.id = m.fornecedor_id`;

const erroNegocio = (code, mensagem) => Object.assign(new Error(mensagem), { code });
const reais = (c) => (c / 100).toFixed(2);

const getMovimentacoes = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY m.data_hora DESC, m.id DESC`);
  return rows;
};

const getMovimentacoesProduto = async (produtoId) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE m.produto_id = ? ORDER BY m.data_hora DESC, m.id DESC`,
    [produtoId]
  );
  return rows;
};

const getMovimentacaoID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE m.id = ?`, [id]);
  return rows[0] || null;
};

/*
  Usado para ajustes manuais ou perdas de estoque (RF26 / RF24).
  Tipos permitidos no ENUM do banco: 'AJUSTE_MANUAL', 'PERDA'
  Motivos permitidos no ENUM: 'PERDA', 'CONTAGEM', 'DEVOLUCAO', 'OUTRO'
*/
const postMovimentacaoManual = async (dados, usuario_id = null) => {
  const usuario = usuario_id ?? dados.usuario_id;
  const produto_id = Number(dados.produto_id ?? dados.produto);
  const quantidade = Number(dados.quantidade);
  const tipo = dados.tipo; // 'AJUSTE_MANUAL' ou 'PERDA'
  const motivo = dados.motivo ?? null;
  const observacao = dados.observacao ?? null;

  if (!usuario) throw erroNegocio("USUARIO_OBRIGATORIO", "Usuário não informado.");
  if (!produto_id) throw erroNegocio("PRODUTO_INVALIDO", "Produto não informado.");
  if (!Number.isInteger(quantidade) || quantidade === 0) {
    throw erroNegocio("QUANTIDADE_INVALIDA", "A quantidade deve ser diferente de zero.");
  }
  if (!['AJUSTE_MANUAL', 'PERDA'].includes(tipo)) {
    throw erroNegocio("TIPO_INVALIDO", "Tipo de movimentação manual inválido.");
  }
  if (tipo === 'PERDA' && quantidade > 0) {
    throw erroNegocio("QUANTIDADE_INVALIDA", "Perdas devem ter quantidade negativa.");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [prod] = await conn.query(
      "SELECT quantidade_estoque, custo_aquisicao FROM produto WHERE id = ? AND ativo = TRUE FOR UPDATE",
      [produto_id]
    );
    if (prod.length === 0) {
      throw erroNegocio("PRODUTO_INVALIDO", "Produto não encontrado ou inativo.");
    }

    const estoqueAtual = prod[0].quantidade_estoque;
    const saldoApos = estoqueAtual + quantidade;

    if (saldoApos < 0) {
      throw erroNegocio("ESTOQUE_INSUFICIENTE", "O ajuste deixaria o estoque negativo.");
    }

    await conn.query("UPDATE produto SET quantidade_estoque = ? WHERE id = ?", [saldoApos, produto_id]);

    const [mov] = await conn.query(
      `INSERT INTO movimentacao_estoque
         (produto_id, usuario_id, tipo, quantidade, saldo_apos, motivo, observacao, custo_unitario)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        produto_id,
        usuario,
        tipo,
        quantidade,
        saldoApos,
        motivo,
        observacao,
        prod[0].custo_aquisicao,
      ]
    );

    await conn.commit();
    return getMovimentacaoID(mov.insertId);
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
};

export default {
  getMovimentacoes,
  getMovimentacoesProduto,
  getMovimentacaoID,
  postMovimentacaoManual,
};