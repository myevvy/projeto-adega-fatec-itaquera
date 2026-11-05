import db from "../../../config/db.js";

const criarSessao = async (usuario_id, token_hash, ip_origem = null, dispositivo = null) => {
  const [result] = await db.query(
    `INSERT INTO sessao (usuario_id, token_hash, ip_origem, dispositivo)
     VALUES (?, ?, ?, ?)`,
    [usuario_id, token_hash, ip_origem, dispositivo],
  );
  return result.insertId;
};

export default { criarSessao };