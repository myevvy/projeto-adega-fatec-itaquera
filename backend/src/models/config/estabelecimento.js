import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT id, nome_estabelecimento, categoria_estabelecimento, 
         telefone_comercial, onboarding_concluido, criado_em, atualizado_em
    FROM estabelecimento`;

const getEstabelecimento = async () => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE id = 1`);
  return rows[0] || null;
};

const atualizarEstabelecimento = async (dados) => {
  const { nome_estabelecimento, categoria_estabelecimento, telefone_comercial, onboarding_concluido } = dados;
  
  await db.query(
    `UPDATE estabelecimento 
        SET nome_estabelecimento = ?, categoria_estabelecimento = ?, 
            telefone_comercial = ?, onboarding_concluido = ?
      WHERE id = 1`,
    [nome_estabelecimento, categoria_estabelecimento, telefone_comercial, onboarding_concluido]
  );

  return getEstabelecimento();
};

export default {
  getEstabelecimento,
  atualizarEstabelecimento,
};