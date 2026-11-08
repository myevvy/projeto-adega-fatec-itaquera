import db from "../../../config/db.js";

const erroNegocio = (code, mensagem) => Object.assign(new Error(mensagem), { code });

const CAMPOS_PUBLICOS =
  "u.id, u.perfil_id, p.nome AS tipo, u.nome, u.email, u.telefone, " +
  "DATE_FORMAT(u.data_nascimento, '%Y-%m-%d') AS aniversario, u.cargo, u.ativo";
const FROM = "FROM usuario u JOIN perfil p ON p.id = u.perfil_id";

const getUsuario = async (email) => {
  if (email === undefined) {
    const [rows] = await db.query(`SELECT ${CAMPOS_PUBLICOS} ${FROM} ORDER BY u.nome`);
    return rows;
  }
  const [rows] = await db.query(
    `SELECT ${CAMPOS_PUBLICOS}, u.senha_hash ${FROM} WHERE u.email = ?`,
    [email],
  );
  return rows[0] || null;
};

const getUsuarioID = async (id) => {
  const [rows] = await db.query(`SELECT ${CAMPOS_PUBLICOS} ${FROM} WHERE u.id = ?`, [id]);
  return rows[0] || null;
};

const getUsuarioPorId = getUsuarioID;

const postUsuario = async (perfil_id, nome, email, senha_hash, telefone) => {
  const [result] = await db.query(
    `INSERT INTO usuario (perfil_id, nome, email, telefone, senha_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [perfil_id, nome, email, telefone || null, senha_hash],
  );
  return result.insertId;
};

const putUsuario = async (
  id, nome, email, senha_hash, _end, _cep, tel, aniversario, _sobre, cargo, tipo_logado
) => {
  const vazio = (v) => (v === "" || v === undefined ? null : v);

  const campos = {
    nome: vazio(nome),
    email: vazio(email),
    telefone: vazio(tel),
    data_nascimento: vazio(aniversario),
  };

  if (senha_hash !== undefined && senha_hash !== null) {
    campos.senha_hash = senha_hash;
  }

  if (tipo_logado === "ADMINISTRADOR" && cargo !== undefined) {
    campos.cargo = vazio(cargo);
  }

  const chaves = Object.keys(campos).filter((k) => campos[k] !== undefined);
  if (chaves.length === 0) return false;

  if (email !== undefined && email !== null) {
    const [outro] = await db.query("SELECT id FROM usuario WHERE email = ? AND id <> ?", [email, id]);
    if (outro.length > 0) throw erroNegocio("EMAIL_EM_USO", "Esse e-mail já está em uso.");
  }

  const sets = chaves.map((k) => `${k} = ?`).join(", ");
  const valores = [...chaves.map((k) => campos[k]), id];

  await db.query(`UPDATE usuario SET ${sets} WHERE id = ?`, valores);
  return true;
};

const alterarStatus = async (id, status) => {
  const ativo = status === "ativo";

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE usuario SET ativo = ? WHERE id = ?", [ativo, id]);
    if (!ativo) {
      await conn.query(
        "UPDATE sessao SET ativa = FALSE, data_hora_fim = NOW() WHERE usuario_id = ? AND ativa = TRUE",
        [id],
      );
    }
    await conn.commit();
    return true;
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
};

export default {
  getUsuario,
  getUsuarioID,
  getUsuarioPorId,
  postUsuario,
  putUsuario,
  alterarStatus,
};