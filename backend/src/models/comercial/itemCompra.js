import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT ic.id, ic.compra_id, ic.produto_id, p.nome AS produto,
         ic.quantidade, ic.custo_aquisicao, ic.subtotal
    FROM item_compra ic
    JOIN produto p ON p.id = ic.produto_id`;

const getItensPorCompra = async (compraId) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE ic.compra_id = ? ORDER BY ic.id ASC`,
    [compraId]
  );
  return rows;
};

const getItemCompraID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE ic.id = ?`, [id]);
  return rows[0] || null;
};

export default {
  getItensPorCompra,
  getItemCompraID,
};