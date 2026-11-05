import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT id, nome, descricao
    FROM perfil`;

const getPerfis = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY id ASC`);
  return rows;
};

const getPerfilID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE id = ?`, [id]);
  return rows[0] || null;
};

export default {
  getPerfis,
  getPerfilID,
};