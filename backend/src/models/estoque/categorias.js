import db from "../../../config/db.js";


const getCategorias = async (filtro) => {
  if (filtro === undefined) {
    const [rows] = await db.query(
      `SELECT c.id, c.nome, COUNT(p.id) AS total_produtos
         FROM categoria_produto c
         LEFT JOIN produto p ON p.categoria_id = c.id AND p.ativo = TRUE
        WHERE c.ativa = TRUE
        GROUP BY c.id, c.nome
        ORDER BY c.nome`,
    );
    return rows;
  }

  const ehId = /^\d+$/.test(String(filtro));
  const [rows] = await db.query(
    `SELECT id, nome, ativa FROM categoria_produto WHERE ${ehId ? "id" : "nome"} = ?`,
    [filtro],
  );
  return rows[0] || null;
};

const postCategorias = async (nome) => {
  const [existentes] = await db.query(
    "SELECT id, ativa FROM categoria_produto WHERE nome = ?",
    [nome],
  );

  if (existentes.length > 0) {
    if (existentes[0].ativa) return null;
    await db.query("UPDATE categoria_produto SET ativa = TRUE WHERE id = ?", [
      existentes[0].id,
    ]);
    return existentes[0].id;
  }

  const [result] = await db.query(
    "INSERT INTO categoria_produto (nome) VALUES (?)",
    [nome],
  );
  return result.insertId;
};

const putCategorias = async (id, nome) => {
  const [result] = await db.query(
    "UPDATE categoria_produto SET nome = ? WHERE id = ?",
    [nome, id],
  );
  return result.affectedRows;
};

const deleteCategorias = async (id) => {
  const [result] = await db.query(
    "UPDATE categoria_produto SET ativa = FALSE WHERE id = ?",
    [id],
  );
  return result.affectedRows;
};

// Para o controller poder bloquear a exclusão de categoria em uso
const contarProdutosDaCategoria = async (id) => {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS total FROM produto WHERE categoria_id = ? AND ativo = TRUE",
    [id],
  );
  return rows[0].total;
};

export default {
  getCategorias,
  postCategorias,
  putCategorias,
  deleteCategorias,
  contarProdutosDaCategoria,
};