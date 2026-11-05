import db from "../../../config/db.js";

const associarPermissao = async (perfilId, permissaoId) => {
  await db.query(
    `INSERT IGNORE INTO perfil_permissao (perfil_id, permissao_id) VALUES (?, ?)`,
    [perfilId, permissaoId]
  );
  return true;
};

const desassociarPermissao = async (perfilId, permissaoId) => {
  await db.query(
    `DELETE FROM perfil_permissao WHERE perfil_id = ? AND permissao_id = ?`,
    [perfilId, permissaoId]
  );
  return true;
};

export default {
  associarPermissao,
  desassociarPermissao,
};