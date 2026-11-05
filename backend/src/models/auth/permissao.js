import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT id, codigo, descricao
    FROM permissao`;

const getPermissoes = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY id ASC`);
  return rows;
};

const getPermissoesPorPerfil = async (perfilId) => {
  const [rows] = await db.query(
    `SELECT p.id, p.codigo, p.descricao
       FROM perfil_permissao pp
       JOIN permissao p ON p.id = pp.permissao_id
      WHERE pp.perfil_id = ?`,
    [perfilId]
  );
  return rows;
};

export default {
  getPermissoes,
  getPermissoesPorPerfil,
};