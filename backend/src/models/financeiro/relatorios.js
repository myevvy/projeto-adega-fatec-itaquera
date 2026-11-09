import db from "../../../config/db.js";

const obterResumo = async (inicio, fimExclusivo) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS totalVendas,
            COALESCE(SUM(v.valor_total), 0) AS faturamento,
            COALESCE(SUM(itens.quantidade), 0) AS produtosVendidos
       FROM venda v
       LEFT JOIN (
         SELECT venda_id, SUM(quantidade) AS quantidade
           FROM item_venda
          GROUP BY venda_id
       ) itens ON itens.venda_id = v.id
      WHERE v.status = 'CONCLUIDA'
        AND v.finalizada_em >= ?
        AND v.finalizada_em < ?`,
    [inicio, fimExclusivo],
  );

  const row = rows[0];
  const faturamento = Number(row.faturamento);
  const totalVendas = Number(row.totalVendas);

  return {
    totalVendas,
    faturamento,
    produtosVendidos: Number(row.produtosVendidos),
    ticketMedio: totalVendas > 0 ? faturamento / totalVendas : 0,
  };
};

const obterVendasPorDia = async (inicio, fimExclusivo) => {
  const [rows] = await db.query(
    `SELECT DATE_FORMAT(v.finalizada_em, '%Y-%m-%d') AS data,
            COUNT(*) AS totalVendas,
            SUM(v.valor_total) AS faturamento,
            COALESCE(SUM(itens.quantidade), 0) AS produtosVendidos
       FROM venda v
       LEFT JOIN (
         SELECT venda_id, SUM(quantidade) AS quantidade
           FROM item_venda
          GROUP BY venda_id
       ) itens ON itens.venda_id = v.id
      WHERE v.status = 'CONCLUIDA'
        AND v.finalizada_em >= ?
        AND v.finalizada_em < ?
      GROUP BY DATE(v.finalizada_em)
      ORDER BY DATE(v.finalizada_em) ASC`,
    [inicio, fimExclusivo],
  );

  return rows.map((row) => ({
    data: row.data,
    totalVendas: Number(row.totalVendas),
    faturamento: Number(row.faturamento),
    produtosVendidos: Number(row.produtosVendidos),
  }));
};

const obterProdutosMaisVendidos = async (inicio, fimExclusivo) => {
  const [rows] = await db.query(
    `SELECT p.id AS produtoId, p.nome AS produto,
            SUM(iv.quantidade) AS quantidadeVendida,
            SUM(iv.subtotal) AS faturamento
       FROM venda v
       JOIN item_venda iv ON iv.venda_id = v.id
       JOIN produto p ON p.id = iv.produto_id
      WHERE v.status = 'CONCLUIDA'
        AND v.finalizada_em >= ?
        AND v.finalizada_em < ?
      GROUP BY p.id, p.nome
      ORDER BY quantidadeVendida DESC, faturamento DESC, p.nome ASC
      LIMIT 10`,
    [inicio, fimExclusivo],
  );

  return rows.map((row) => ({
    produtoId: Number(row.produtoId),
    produto: row.produto,
    quantidadeVendida: Number(row.quantidadeVendida),
    faturamento: Number(row.faturamento),
  }));
};

const obterVendasPorFormaPagamento = async (inicio, fimExclusivo) => {
  const [rows] = await db.query(
    `SELECT COALESCE(v.forma_pagamento, 'Não informado') AS formaPagamento,
            COUNT(*) AS totalVendas,
            SUM(v.valor_total) AS faturamento
       FROM venda v
      WHERE v.status = 'CONCLUIDA'
        AND v.finalizada_em >= ?
        AND v.finalizada_em < ?
      GROUP BY v.forma_pagamento
      ORDER BY totalVendas DESC, formaPagamento ASC`,
    [inicio, fimExclusivo],
  );

  return rows.map((row) => ({
    formaPagamento: row.formaPagamento,
    totalVendas: Number(row.totalVendas),
    faturamento: Number(row.faturamento),
  }));
};

const obterResumoDespesas = async (inicio, fimExclusivo) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS totalLancamentos,
            COALESCE(SUM(d.valor), 0) AS totalDespesas
       FROM despesa d
      WHERE d.estornada = FALSE
        AND d.data >= ?
        AND d.data < ?`,
    [inicio, fimExclusivo],
  );

  return {
    totalLancamentos: Number(rows[0].totalLancamentos),
    totalDespesas: Number(rows[0].totalDespesas),
  };
};

const obterDespesasPorCategoria = async (inicio, fimExclusivo) => {
  const [rows] = await db.query(
    `SELECT c.id AS categoriaId, c.nome AS categoria,
            COUNT(d.id) AS totalLancamentos,
            SUM(d.valor) AS totalDespesas
       FROM despesa d
       JOIN categoria_despesa c ON c.id = d.categoria_id
      WHERE d.estornada = FALSE
        AND d.data >= ?
        AND d.data < ?
      GROUP BY c.id, c.nome
      ORDER BY totalDespesas DESC, c.nome ASC`,
    [inicio, fimExclusivo],
  );

  return rows.map((row) => ({
    categoriaId: Number(row.categoriaId),
    categoria: row.categoria,
    totalLancamentos: Number(row.totalLancamentos),
    totalDespesas: Number(row.totalDespesas),
  }));
};

const obterHistoricoDespesas = async (inicio, fimExclusivo) => {
  const [rows] = await db.query(
    `SELECT d.id, DATE_FORMAT(d.data, '%Y-%m-%d') AS data,
            d.descricao, c.nome AS categoria, d.valor,
            d.forma_pagamento AS formaPagamento,
            d.compra_id AS compraId, u.nome AS usuario
       FROM despesa d
       JOIN categoria_despesa c ON c.id = d.categoria_id
       JOIN usuario u ON u.id = d.usuario_id
      WHERE d.estornada = FALSE
        AND d.data >= ?
        AND d.data < ?
      ORDER BY d.data DESC, d.id DESC`,
    [inicio, fimExclusivo],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    data: row.data,
    descricao: row.descricao,
    categoria: row.categoria,
    valor: Number(row.valor),
    formaPagamento: row.formaPagamento,
    compraId: row.compraId === null ? null : Number(row.compraId),
    usuario: row.usuario,
  }));
};

const obterRelatorioDespesas = async ({ inicio, fimExclusivo }) => {
  const [resumo, despesasPorCategoria, historico] = await Promise.all([
    obterResumoDespesas(inicio, fimExclusivo),
    obterDespesasPorCategoria(inicio, fimExclusivo),
    obterHistoricoDespesas(inicio, fimExclusivo),
  ]);

  return {
    resumo,
    despesasPorCategoria: despesasPorCategoria.map((categoria) => ({
      ...categoria,
      percentual:
        resumo.totalDespesas === 0
          ? 0
          : (categoria.totalDespesas / resumo.totalDespesas) * 100,
    })),
    historico,
  };
};

const obterRelatorioVendas = async ({
  inicio,
  inicioAnterior,
  fimAnteriorExclusivo,
  fimExclusivo,
}) => {
  const [resumo, resumoAnterior, vendasPorDia, produtosMaisVendidos, vendasPorFormaPagamento] =
    await Promise.all([
      obterResumo(inicio, fimExclusivo),
      obterResumo(inicioAnterior, fimAnteriorExclusivo),
      obterVendasPorDia(inicio, fimExclusivo),
      obterProdutosMaisVendidos(inicio, fimExclusivo),
      obterVendasPorFormaPagamento(inicio, fimExclusivo),
    ]);

  return {
    resumo,
    resumoAnterior,
    vendasPorDia,
    produtosMaisVendidos,
    vendasPorFormaPagamento,
  };
};

export default { obterRelatorioVendas, obterRelatorioDespesas };
