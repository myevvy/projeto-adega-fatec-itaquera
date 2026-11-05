import db from "../../../config/db.js";

const SELECT_BASE = `
  SELECT usuario_id, push, email, estoque_baixo, produto_esgotado, resumo_vendas
    FROM preferencia_notificacao`;

const getPreferenciaPorUsuario = async (usuarioId) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE usuario_id = ?`, [usuarioId]);
  // Se o usuário ainda não tiver preferências cadastradas, retorna um objeto padrão limpo
  return rows[0] || {
    usuario_id: usuarioId,
    push: true,
    email: false,
    estoque_baixo: true,
    produto_esgotado: true,
    resumo_vendas: false,
  };
};

const salvarPreferencia = async (usuarioId, dados) => {
  const { push, email, estoque_baixo, produto_esgotado, resumo_vendas } = dados;

  // Utiliza UPSERT (INSERT ... ON DUPLICATE KEY UPDATE) para inserir ou atualizar perfeitamente
  await db.query(
    `INSERT INTO preferencia_notificacao (usuario_id, push, email, estoque_baixo, produto_esgotado, resumo_vendas)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       push = VALUES(push),
       email = VALUES(email),
       estoque_baixo = VALUES(estoque_baixo),
       produto_esgotado = VALUES(produto_esgotado),
       resumo_vendas = VALUES(resumo_vendas)`,
    [usuarioId, push ?? true, email ?? false, estoque_baixo ?? true, produto_esgotado ?? true, resumo_vendas ?? false]
  );

  return getPreferenciaPorUsuario(usuarioId);
};

export default {
  getPreferenciaPorUsuario,
  salvarPreferencia,
};