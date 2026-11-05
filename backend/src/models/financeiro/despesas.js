import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT d.id, d.usuario_id, u.nome AS usuario,
         d.categoria_id, c.nome AS categoria, c.tipo AS tipo_categoria,
         d.descricao, d.valor, DATE_FORMAT(d.data, '%Y-%m-%d') AS data,
         d.registrada_em, d.forma_pagamento, d.compra_id,
         d.estornada, d.estornada_em
    FROM despesa d
    JOIN usuario u ON u.id = d.usuario_id
    JOIN categoria_despesa c ON c.id = d.categoria_id`;

const erroNegocio = (code, mensagem) => Object.assign(new Error(mensagem), { code });

const getDespesas = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY d.data DESC, d.id DESC`);
  return rows;
};

const getDespesaID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE d.id = ?`, [id]);
  return rows[0] || null;
};

const postDespesa = async (dados, usuario_id = null) => {
  const usuario = usuario_id ?? dados.usuario_id;
  const categoria_id = Number(dados.categoria_id ?? dados.categoria);
  const descricao = dados.descricao;
  const valor = Number(dados.valor);
  const data = dados.data;
  const forma_pagamento = dados.forma_pagamento ?? null;
  const compra_id = dados.compra_id ? Number(dados.compra_id) : null;

  if (!usuario) throw erroNegocio("USUARIO_OBRIGATORIO", "Usuário não informado.");
  if (!categoria_id) throw erroNegocio("CATEGORIA_OBRIGATORIA", "Categoria da despesa não informada.");
  if (!descricao) throw erroNegocio("DESCRICAO_OBRIGATORIA", "Descrição da despesa obrigatória.");
  if (!Number.isFinite(valor) || valor <= 0) {
    throw erroNegocio("VALOR_INVALIDO", "O valor da despesa deve ser maior que zero.");
  }
  if (!data) throw erroNegocio("DATA_OBRIGATORIA", "Data da despesa não informada.");

  const [cat] = await db.query("SELECT id FROM categoria_despesa WHERE id = ? AND ativa = TRUE", [categoria_id]);
  if (cat.length === 0) {
    throw erroNegocio("CATEGORIA_INVALIDA", "Categoria de despesa não encontrada ou inativa.");
  }

  const [result] = await db.query(
    `INSERT INTO despesa
       (usuario_id, categoria_id, descricao, valor, data, forma_pagamento, compra_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuario, categoria_id, descricao, valor, data, forma_pagamento, compra_id]
  );

  return getDespesaID(result.insertId);
};

const estornarDespesa = async (id) => {
  const [result] = await db.query(
    "UPDATE despesa SET estornada = TRUE, estornada_em = NOW() WHERE id = ? AND estornada = FALSE",
    [id]
  );
  return result.affectedRows;
};

export default {
  getDespesas,
  getDespesaID,
  postDespesa,
  estornarDespesa,
};