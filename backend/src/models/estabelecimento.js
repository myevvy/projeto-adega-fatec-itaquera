import db from "../../config/db.js";

const getEstabelecimento = async () => {
  const [rows] = await db.query(
    `SELECT id, nome_estabelecimento, categoria_estabelecimento,
            telefone_comercial, onboarding_concluido, criado_em, atualizado_em
       FROM estabelecimento
      WHERE id = 1
      LIMIT 1`,
  );
  return rows[0] || null;
};

const saveEstabelecimento = async ({
  nome_estabelecimento,
  categoria_estabelecimento,
  telefone_comercial,
}) => {
  await db.query(
    `INSERT INTO estabelecimento
       (id, nome_estabelecimento, categoria_estabelecimento,
        telefone_comercial, onboarding_concluido, criado_em, atualizado_em)
     VALUES (1, ?, ?, ?, TRUE, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       nome_estabelecimento = ?,
       categoria_estabelecimento = ?,
       telefone_comercial = ?,
       onboarding_concluido = TRUE,
       atualizado_em = NOW()`,
    [
      nome_estabelecimento,
      categoria_estabelecimento,
      telefone_comercial,
      nome_estabelecimento,
      categoria_estabelecimento,
      telefone_comercial,
    ],
  );
  return getEstabelecimento();
};

export default { getEstabelecimento, saveEstabelecimento };
