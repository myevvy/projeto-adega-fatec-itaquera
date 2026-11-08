import db from "../../../config/db.js";

const criarSessao = async (usuario_id, token_hash, ip_origem = null, dispositivo = null) => {
  const [result] = await db.query(
    `INSERT INTO sessao (usuario_id, token_hash, ip_origem, dispositivo)
     VALUES (?, ?, ?, ?)`,
    [usuario_id, token_hash, ip_origem, dispositivo],
  );
  return result.insertId;
};

const buscarSessaoAtiva = async (token_hash) => {
  const [rows] = await db.query(
    `SELECT id, usuario_id, token_hash, ip_origem, dispositivo, data_hora_inicio
       FROM sessao
      WHERE token_hash = ? AND ativa = TRUE`,
    [token_hash],
  );
  return rows[0] || null;
};

const encerrarSessao = async (token_hash) => {
  const [result] = await db.query(
    `UPDATE sessao
        SET ativa = FALSE, data_hora_fim = NOW()
      WHERE token_hash = ? AND ativa = TRUE`,
    [token_hash],
  );
  return result.affectedRows;
};

const encerrarTodasSessoes = async (usuario_id) => {
  const [result] = await db.query(
    `UPDATE sessao
        SET ativa = FALSE, data_hora_fim = NOW()
      WHERE usuario_id = ? AND ativa = TRUE`,
    [usuario_id],
  );
  return result.affectedRows;
};

const listarSessoesAtivas = async (usuario_id) => {
  const [rows] = await db.query(
    `SELECT id, ip_origem, dispositivo, data_hora_inicio
       FROM sessao
      WHERE usuario_id = ? AND ativa = TRUE
      ORDER BY data_hora_inicio DESC`,
    [usuario_id],
  );
  return rows;
};

export default {
  criarSessao,
  buscarSessaoAtiva,
  encerrarSessao,
  encerrarTodasSessoes,
  listarSessoesAtivas,
};