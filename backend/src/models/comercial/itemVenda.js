import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT iv.id, iv.venda_id, iv.produto_id, p.nome AS produto,
         iv.quantidade, iv.preco_unitario, iv.custo_unitario, iv.subtotal
    FROM item_venda iv
    JOIN produto p ON p.id = iv.produto_id`;

const getItensPorVenda = async (vendaId) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE iv.venda_id = ? ORDER BY iv.id ASC`,
    [vendaId]
  );
  return rows;
};

const getItemVendaID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE iv.id = ?`, [id]);
  return rows[0] || null;
};

export default {
  getItensPorVenda,
  getItemVendaID,
};