import db from "../../../config/db.js";

const registrarConfirmacao = async (usuarioId, tipoOperacao, alvo = {}) => {
  const { vendaId = null, compraId = null, produtoId = null, movimentacaoId = null } = alvo;
  
  const [result] = await db.query(
    `INSERT INTO confirmacao_operacao (usuario_id, tipo_operacao, venda_id, compra_id, produto_id, movimentacao_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuarioId, tipoOperacao, vendaId, compraId, produtoId, movimentacaoId]
  );
  return result.insertId;
};

const getConfirmacoes = async () => {
  const [rows] = await db.query(
    `SELECT c.id, c.usuario_id, u.nome AS usuario,
            c.tipo_operacao, c.confirmada,
            DATE_FORMAT(c.data_hora, '%Y-%m-%d %H:%i:%s') AS data_hora
       FROM confirmacao_operacao c
       JOIN usuario u ON u.id = c.usuario_id
      ORDER BY c.data_hora DESC`
  );
  return rows;
};

export default {
  registrarConfirmacao,
  getConfirmacoes,
};