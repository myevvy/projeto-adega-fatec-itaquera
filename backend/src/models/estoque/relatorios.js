import db from "../../../config/db.js";

const obterResumoEstoque = async () => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS produtosCadastrados,
            COALESCE(SUM(p.quantidade_estoque), 0) AS unidadesEmEstoque,
            COALESCE(SUM(p.quantidade_estoque * p.custo_aquisicao), 0) AS valorTotalEmEstoque,
            COALESCE(SUM(
              CASE
                WHEN p.quantidade_estoque = 0 OR p.quantidade_estoque < p.quantidade_minima
                THEN 1 ELSE 0
              END
            ), 0) AS produtosEmAlerta
       FROM produto p
      WHERE p.ativo = TRUE`,
  );
  const row = rows[0];

  return {
    produtosCadastrados: Number(row.produtosCadastrados),
    unidadesEmEstoque: Number(row.unidadesEmEstoque),
    valorTotalEmEstoque: Number(row.valorTotalEmEstoque),
    produtosEmAlerta: Number(row.produtosEmAlerta),
  };
};

const obterProdutosEstoque = async () => {
  const [rows] = await db.query(
    `SELECT p.id AS produtoId, p.nome AS produto, c.nome AS categoria,
            p.quantidade_estoque AS quantidadeEmEstoque,
            p.quantidade_minima AS quantidadeMinima,
            p.custo_aquisicao AS custoUnitario,
            p.quantidade_estoque * p.custo_aquisicao AS valorEmEstoque,
            CASE
              WHEN p.quantidade_estoque = 0 THEN 'ZERADO'
              WHEN p.quantidade_estoque < p.quantidade_minima THEN 'BAIXO'
              ELSE 'OK'
            END AS statusEstoque
       FROM produto p
       JOIN categoria_produto c ON c.id = p.categoria_id
      WHERE p.ativo = TRUE
      ORDER BY
        CASE
          WHEN p.quantidade_estoque = 0 THEN 0
          WHEN p.quantidade_estoque < p.quantidade_minima THEN 1
          ELSE 2
        END,
        p.quantidade_estoque ASC,
        p.nome ASC`,
  );

  return rows.map((row) => ({
    produtoId: Number(row.produtoId),
    produto: row.produto,
    categoria: row.categoria,
    quantidadeEmEstoque: Number(row.quantidadeEmEstoque),
    quantidadeMinima: Number(row.quantidadeMinima),
    custoUnitario: Number(row.custoUnitario),
    valorEmEstoque: Number(row.valorEmEstoque),
    statusEstoque: row.statusEstoque,
  }));
};

const obterEstoquePorCategoria = async () => {
  const [rows] = await db.query(
    `SELECT c.id AS categoriaId, c.nome AS categoria,
            COUNT(p.id) AS produtosCadastrados,
            COALESCE(SUM(p.quantidade_estoque), 0) AS unidadesEmEstoque,
            COALESCE(SUM(p.quantidade_estoque * p.custo_aquisicao), 0) AS valorEmEstoque
       FROM categoria_produto c
       LEFT JOIN produto p ON p.categoria_id = c.id AND p.ativo = TRUE
      GROUP BY c.id, c.nome
      ORDER BY c.nome ASC`,
  );

  return rows.map((row) => ({
    categoriaId: Number(row.categoriaId),
    categoria: row.categoria,
    produtosCadastrados: Number(row.produtosCadastrados),
    unidadesEmEstoque: Number(row.unidadesEmEstoque),
    valorEmEstoque: Number(row.valorEmEstoque),
  }));
};

const obterRelatorioEstoque = async () => {
  const [resumo, produtos, estoquePorCategoria] = await Promise.all([
    obterResumoEstoque(),
    obterProdutosEstoque(),
    obterEstoquePorCategoria(),
  ]);

  return {
    geradoEm: new Date().toISOString(),
    resumo,
    alertas: produtos.filter((produto) => produto.statusEstoque !== "OK"),
    produtos,
    estoquePorCategoria,
  };
};

export default { obterRelatorioEstoque };
