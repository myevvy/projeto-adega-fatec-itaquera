import db from "../../config/db.js";

const SELECT_BASE = `
  SELECT p.id, p.nome, p.descricao_produto AS descricao, p.foto_url AS imagem,
         p.volume_ml, p.preco_venda, p.custo_aquisicao,
         p.quantidade_estoque, p.quantidade_minima,
         p.categoria_id, c.nome AS categoria, p.ativo,
         CASE WHEN p.quantidade_estoque = 0 THEN 'ZERADO'
              WHEN p.quantidade_estoque < p.quantidade_minima THEN 'BAIXO'
              ELSE 'OK' END AS status_estoque
    FROM produto p
    JOIN categoria_produto c ON c.id = p.categoria_id`;

// Aceita o id ou o nome da categoria e devolve o id (só categorias ativas)
const resolverCategoriaId = async (categoria) => {
  const ehId = /^\d+$/.test(String(categoria));
  const [rows] = await db.query(
    `SELECT id FROM categoria_produto WHERE ativa = TRUE AND ${ehId ? "id" : "nome"} = ?`,
    [categoria],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error("Categoria não encontrada ou inativa."), {
      code: "CATEGORIA_INVALIDA",
    });
  }
  return rows[0].id;
};


const getProdutos = async (filtro) => {
  if (filtro === undefined) {
    const [rows] = await db.query(
      `${SELECT_BASE} WHERE p.ativo = TRUE ORDER BY p.nome`,
    );
    return rows;
  }

  const ehId = /^\d+$/.test(String(filtro));
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE ${ehId ? "p.id" : "p.nome"} = ?`,
    [filtro],
  );
  return rows[0] || null;
};

const postProdutos = async ({
  nome,
  categoria,
  precoV,
  custo,
  estoque,
  qntMinima,
  desc,
  imagem,
}) => {
  const categoria_id = await resolverCategoriaId(categoria);

  const [result] = await db.query(
    `INSERT INTO produto
       (categoria_id, nome, descricao_produto, foto_url,
        preco_venda, custo_aquisicao, quantidade_estoque, quantidade_minima)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [categoria_id, nome, desc || null, imagem, precoV, custo, estoque, qntMinima],
  );
  return getProdutos(String(result.insertId));
};

const putProdutos = async (id, dados, usuario_id = null) => {
  const categoria_id =
    dados.categoria !== undefined
      ? await resolverCategoriaId(dados.categoria)
      : undefined;

  const campos = {
    nome: dados.nome,
    categoria_id,
    descricao_produto: dados.desc,
    foto_url: dados.imagem,
    quantidade_minima: dados.qntMinima,
    preco_venda: dados.precoV,
    custo_aquisicao: dados.custo,
  };
  const chaves = Object.keys(campos).filter((k) => campos[k] !== undefined);
  if (chaves.length === 0) return false;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT preco_venda, custo_aquisicao FROM produto WHERE id = ? FOR UPDATE",
      [id],
    );
    if (rows.length === 0) {
      await conn.rollback();
      return false;
    }
    const atual = rows[0];

    const precoNovo = campos.preco_venda ?? atual.preco_venda;
    const custoNovo = campos.custo_aquisicao ?? atual.custo_aquisicao;

    if (
      Number(precoNovo) !== Number(atual.preco_venda) ||
      Number(custoNovo) !== Number(atual.custo_aquisicao)
    ) {
      await conn.query(
        `INSERT INTO produto_historico_preco
           (produto_id, preco_venda_anterior, preco_venda_novo,
            custo_anterior, custo_novo, alterado_por)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, atual.preco_venda, precoNovo, atual.custo_aquisicao, custoNovo, usuario_id],
      );
    }

    const sets = chaves.map((k) => `${k} = ?`).join(", ");
    await conn.query(`UPDATE produto SET ${sets} WHERE id = ?`, [
      ...chaves.map((k) => campos[k]),
      id,
    ]);

    await conn.commit();
    return true;
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
};


const deleteProdutos = async (id, usuario_id = null) => {
  const [result] = await db.query(
    `UPDATE produto
        SET ativo = FALSE, inativado_em = NOW(), inativado_por = ?
      WHERE id = ?`,
    [usuario_id, id],
  );
  return result.affectedRows;
};

const reativarProduto = async (id) => {
  const [result] = await db.query(
    `UPDATE produto
        SET ativo = TRUE, inativado_em = NULL, inativado_por = NULL
      WHERE id = ?`,
    [id],
  );
  return result.affectedRows;
};

const getProdutosInativos = async () => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE p.ativo = FALSE ORDER BY p.nome`,
  );
  return rows;
};

const getEstoqueAlertas = async () => {
  const [rows] = await db.query(
    `${SELECT_BASE}
      WHERE p.ativo = TRUE
        AND (p.quantidade_estoque < p.quantidade_minima OR p.quantidade_estoque = 0)
      ORDER BY p.quantidade_estoque, p.nome`,
  );
  return rows;
};

const getHistoricoPreco = async (id) => {
  const [rows] = await db.query(
    `SELECT h.id, h.preco_venda_anterior, h.preco_venda_novo,
            h.custo_anterior, h.custo_novo, h.alterado_em,
            u.nome AS alterado_por
       FROM produto_historico_preco h
       LEFT JOIN usuario u ON u.id = h.alterado_por
      WHERE h.produto_id = ?
      ORDER BY h.alterado_em DESC`,
    [id],
  );
  return rows;
};

export default {
  getProdutos,
  postProdutos,
  putProdutos,
  deleteProdutos,
  reativarProduto,
  getProdutosInativos,
  getEstoqueAlertas,
  getHistoricoPreco,
};