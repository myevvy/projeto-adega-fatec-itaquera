import db from "../../../config/db.js";

const SELECT_BASE =
  "SELECT id, nome, descricao, telefone, email, endereco AS `end`, cidade, estado, ativo FROM fornecedor";


const getFornecedores = async (nome) => {
  if (nome === undefined) {
    const [rows] = await db.query(`${SELECT_BASE} WHERE ativo = TRUE ORDER BY nome`);
    return rows;
  }
  const [rows] = await db.query(`${SELECT_BASE} WHERE ativo = TRUE AND nome = ?`, [nome]);
  return rows[0] || null;
};

const getFornecedorID = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE id = ?`, [id]);
  return rows[0] || null;
};

const postFornecedor = async ({ nome, descricao, telefone, email, end, cidade, estado }) => {
  const [result] = await db.query(
    `INSERT INTO fornecedor (nome, descricao, telefone, email, endereco, cidade, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, descricao ?? null, telefone, email ?? null, end ?? null, cidade ?? null, estado ?? null],
  );
  return getFornecedorID(result.insertId);
};


const putFornecedor = async (id, dados) => {
  const campos = {
    nome: dados.nome,
    descricao: dados.descricao,
    telefone: dados.telefone,
    email: dados.email,
    endereco: dados.end,
    cidade: dados.cidade,
    estado: dados.estado,
  };
  const chaves = Object.keys(campos).filter((k) => campos[k] !== undefined);
  if (chaves.length === 0) return 0;

  const sets = chaves.map((k) => `${k} = ?`).join(", ");
  const [result] = await db.query(`UPDATE fornecedor SET ${sets} WHERE id = ?`, [
    ...chaves.map((k) => campos[k]),
    id,
  ]);
  return result.affectedRows;
};

const deleteFornecedor = async (id) => {
  const [result] = await db.query("UPDATE fornecedor SET ativo = FALSE WHERE id = ?", [id]);
  return result.affectedRows;
};

export default {
  getFornecedores,
  getFornecedorID,
  postFornecedor,
  putFornecedor,
  deleteFornecedor,
};