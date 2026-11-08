import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT n.id, n.usuario_id, u.nome AS usuario,
         n.tipo, n.produto_id, p.nome AS produto,
         n.titulo, n.mensagem, n.lida,
         DATE_FORMAT(n.criada_em, '%Y-%m-%d %H:%i:%s') AS criada_em
    FROM notificacao n
    JOIN usuario u ON u.id = n.usuario_id
    JOIN produto p ON p.id = n.produto_id`;

const getNotificacoesUsuario = async (usuarioId) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE n.usuario_id = ? ORDER BY n.criada_em DESC`,
    [usuarioId]
  );
  return rows;
};

const marcarComoLida = async (id, usuarioId) => {
  const [result] = await db.query(
    "UPDATE notificacao SET lida = TRUE WHERE id = ? AND usuario_id = ?",
    [id, usuarioId]
  );
  return result.affectedRows;
};

const postNotificacao = async (dados) => {
  const { usuario_id, tipo, produto_id, titulo, mensagem } = dados;

  const [result] = await db.query(
    `INSERT INTO notificacao (usuario_id, tipo, produto_id, titulo, mensagem)
     VALUES (?, ?, ?, ?, ?)`,
    [usuario_id, tipo, produto_id, titulo, mensagem]
  );

  const [rows] = await db.query(`${SELECT_BASE} WHERE n.id = ?`, [result.insertId]);
  return rows[0];
};

const contarNaoLidas = async (usuarioId) => {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS total FROM notificacao WHERE usuario_id = ? AND lida = FALSE",
    [usuarioId]
  );
  return rows[0].total;
};

export default {
  getNotificacoesUsuario,
  marcarComoLida,
  postNotificacao,
  contarNaoLidas,
};