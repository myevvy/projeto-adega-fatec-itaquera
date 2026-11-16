import { api, apiErrorMessage } from './api'
import type {
  ExpenseReport,
  ReportComparison,
  ReportPeriod,
  SalesReport,
  StockReport,
  StockReportProduct,
} from '../types/relatorios'

type ApiRecord = Record<string, unknown>

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredRecord(value: unknown, field: string): ApiRecord {
  if (!isRecord(value)) {
    throw new Error(`A API retornou um formato inválido para ${field}.`)
  }
  return value
}

function requiredArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`A API retornou uma lista inválida para ${field}.`)
  }
  return value
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`A API retornou um valor inválido para ${field}.`)
  }
  return value
}

function requiredNumber(value: unknown, field: string): number {
  if (value === null || value === undefined || value === '') {
    throw new Error(`A API retornou um valor inválido para ${field}.`)
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`A API retornou um valor inválido para ${field}.`)
  }
  return parsed
}

function parsePeriod(value: unknown): ReportPeriod {
  const row = requiredRecord(value, 'período')
  return {
    inicio: requiredText(row.inicio, 'data inicial'),
    fim: requiredText(row.fim, 'data final'),
  }
}

function parseComparison(value: unknown): ReportComparison {
  const row = requiredRecord(value, 'comparação')
  const variation = row.variacaoPercentual
  if (variation !== null && typeof variation !== 'number') {
    throw new Error('A API retornou uma variação percentual inválida.')
  }
  return {
    atual: requiredNumber(row.atual, 'valor atual da comparação'),
    anterior: requiredNumber(row.anterior, 'valor anterior da comparação'),
    diferenca: requiredNumber(row.diferenca, 'diferença da comparação'),
    variacaoPercentual: variation,
  }
}

function parseStockProduct(value: unknown): StockReportProduct {
  const row = requiredRecord(value, 'produto do estoque')
  const status = requiredText(row.statusEstoque, 'situação do estoque')
  if (status !== 'ZERADO' && status !== 'BAIXO' && status !== 'OK') {
    throw new Error('A API retornou uma situação de estoque desconhecida.')
  }
  return {
    produtoId: requiredNumber(row.produtoId, 'id do produto'),
    produto: requiredText(row.produto, 'nome do produto'),
    categoria: requiredText(row.categoria, 'categoria do produto'),
    quantidadeEmEstoque: requiredNumber(
      row.quantidadeEmEstoque,
      'quantidade em estoque',
    ),
    quantidadeMinima: requiredNumber(row.quantidadeMinima, 'estoque mínimo'),
    custoUnitario: requiredNumber(row.custoUnitario, 'custo unitário'),
    valorEmEstoque: requiredNumber(row.valorEmEstoque, 'valor em estoque'),
    statusEstoque: status,
  }
}

async function getReport<T>(
  path: string,
  token: string,
  parse: (value: unknown) => T,
  params?: ReportPeriod,
): Promise<T> {
  try {
    const response = await api.get<unknown>(path, {
      headers: { Authorization: `Bearer ${token}` },
      params: params
        ? { inicio: params.inicio, fim: params.fim }
        : undefined,
    })
    return parse(response.data)
  } catch (error) {
    throw new Error(
      apiErrorMessage(error, 'Não foi possível carregar o relatório.'),
      { cause: error },
    )
  }
}

function parseSalesReport(value: unknown): SalesReport {
  const row = requiredRecord(value, 'relatório de vendas')
  const periodo = parsePeriod(row.periodo)
  const periodoRow = requiredRecord(row.periodo, 'período do relatório')
  const resumo = requiredRecord(row.resumo, 'resumo de vendas')
  const comparacao = requiredRecord(row.comparacao, 'comparação de vendas')
  const graficos = requiredRecord(row.graficos, 'gráficos de vendas')

  return {
    periodo: {
      ...periodo,
      quantidadeDias: requiredNumber(
        periodoRow.quantidadeDias,
        'quantidade de dias',
      ),
    },
    resumo: {
      totalVendas: requiredNumber(resumo.totalVendas, 'total de vendas'),
      faturamento: requiredNumber(resumo.faturamento, 'faturamento'),
      produtosVendidos: requiredNumber(
        resumo.produtosVendidos,
        'produtos vendidos',
      ),
      ticketMedio: requiredNumber(resumo.ticketMedio, 'ticket médio'),
    },
    comparacao: {
      periodoAnterior: parsePeriod(comparacao.periodoAnterior),
      totalVendas: parseComparison(comparacao.totalVendas),
      faturamento: parseComparison(comparacao.faturamento),
      produtosVendidos: parseComparison(comparacao.produtosVendidos),
    },
    graficos: {
      vendasPorDia: requiredArray(
        graficos.vendasPorDia,
        'vendas por dia',
      ).map((item) => {
        const point = requiredRecord(item, 'venda por dia')
        return {
          data: requiredText(point.data, 'data da venda'),
          totalVendas: requiredNumber(point.totalVendas, 'vendas do dia'),
          faturamento: requiredNumber(point.faturamento, 'faturamento do dia'),
          produtosVendidos: requiredNumber(
            point.produtosVendidos,
            'produtos vendidos no dia',
          ),
        }
      }),
      produtosMaisVendidos: requiredArray(
        graficos.produtosMaisVendidos,
        'produtos mais vendidos',
      ).map((item) => {
        const product = requiredRecord(item, 'produto mais vendido')
        return {
          produtoId: requiredNumber(product.produtoId, 'id do produto'),
          produto: requiredText(product.produto, 'nome do produto'),
          quantidadeVendida: requiredNumber(
            product.quantidadeVendida,
            'quantidade vendida',
          ),
          faturamento: requiredNumber(
            product.faturamento,
            'faturamento do produto',
          ),
        }
      }),
      vendasPorFormaPagamento: requiredArray(
        graficos.vendasPorFormaPagamento,
        'vendas por forma de pagamento',
      ).map((item) => {
        const payment = requiredRecord(item, 'forma de pagamento')
        return {
          formaPagamento: requiredText(
            payment.formaPagamento,
            'forma de pagamento',
          ),
          totalVendas: requiredNumber(
            payment.totalVendas,
            'vendas por forma de pagamento',
          ),
          faturamento: requiredNumber(
            payment.faturamento,
            'faturamento por forma de pagamento',
          ),
        }
      }),
    },
  }
}

function parseStockReport(value: unknown): StockReport {
  const row = requiredRecord(value, 'relatório de estoque')
  const resumo = requiredRecord(row.resumo, 'resumo do estoque')

  return {
    geradoEm: requiredText(row.geradoEm, 'data de geração do relatório'),
    resumo: {
      produtosCadastrados: requiredNumber(
        resumo.produtosCadastrados,
        'produtos cadastrados',
      ),
      unidadesEmEstoque: requiredNumber(
        resumo.unidadesEmEstoque,
        'unidades em estoque',
      ),
      valorTotalEmEstoque: requiredNumber(
        resumo.valorTotalEmEstoque,
        'valor total em estoque',
      ),
      produtosEmAlerta: requiredNumber(
        resumo.produtosEmAlerta,
        'produtos em alerta',
      ),
    },
    alertas: requiredArray(row.alertas, 'alertas de estoque').map(
      parseStockProduct,
    ),
    produtos: requiredArray(row.produtos, 'produtos em estoque').map(
      parseStockProduct,
    ),
    estoquePorCategoria: requiredArray(
      row.estoquePorCategoria,
      'estoque por categoria',
    ).map((item) => {
      const category = requiredRecord(item, 'categoria do estoque')
      return {
        categoriaId: requiredNumber(category.categoriaId, 'id da categoria'),
        categoria: requiredText(category.categoria, 'nome da categoria'),
        produtosCadastrados: requiredNumber(
          category.produtosCadastrados,
          'produtos cadastrados por categoria',
        ),
        unidadesEmEstoque: requiredNumber(
          category.unidadesEmEstoque,
          'unidades por categoria',
        ),
        valorEmEstoque: requiredNumber(
          category.valorEmEstoque,
          'valor em estoque por categoria',
        ),
      }
    }),
  }
}

function parseExpenseReport(value: unknown): ExpenseReport {
  const row = requiredRecord(value, 'relatório de despesas')
  const resumo = requiredRecord(row.resumo, 'resumo de despesas')
  const graficos = requiredRecord(row.graficos, 'gráficos de despesas')

  return {
    periodo: parsePeriod(row.periodo),
    resumo: {
      totalLancamentos: requiredNumber(
        resumo.totalLancamentos,
        'lançamentos de despesas',
      ),
      totalDespesas: requiredNumber(resumo.totalDespesas, 'total de despesas'),
    },
    graficos: {
      despesasPorCategoria: requiredArray(
        graficos.despesasPorCategoria,
        'despesas por categoria',
      ).map((item) => {
        const category = requiredRecord(item, 'categoria de despesas')
        return {
          categoriaId: requiredNumber(
            category.categoriaId,
            'id da categoria',
          ),
          categoria: requiredText(category.categoria, 'nome da categoria'),
          totalLancamentos: requiredNumber(
            category.totalLancamentos,
            'lançamentos por categoria',
          ),
          totalDespesas: requiredNumber(
            category.totalDespesas,
            'total por categoria',
          ),
          percentual: requiredNumber(
            category.percentual,
            'percentual da categoria',
          ),
        }
      }),
    },
    historico: requiredArray(row.historico, 'histórico de despesas').map(
      (item) => {
        const expense = requiredRecord(item, 'despesa do histórico')
        const formaPagamento = expense.formaPagamento
        const compraId = expense.compraId
        if (
          formaPagamento !== null &&
          typeof formaPagamento !== 'string'
        ) {
          throw new Error('A API retornou uma forma de pagamento inválida.')
        }
        if (compraId !== null && typeof compraId !== 'number') {
          throw new Error('A API retornou um vínculo de compra inválido.')
        }
        return {
          id: requiredNumber(expense.id, 'id da despesa'),
          data: requiredText(expense.data, 'data da despesa'),
          descricao: requiredText(expense.descricao, 'descrição da despesa'),
          categoria: requiredText(expense.categoria, 'categoria da despesa'),
          valor: requiredNumber(expense.valor, 'valor da despesa'),
          formaPagamento,
          compraId,
          usuario: requiredText(expense.usuario, 'usuário responsável'),
        }
      },
    ),
  }
}

export function getSalesReport(
  token: string,
  period: ReportPeriod,
): Promise<SalesReport> {
  return getReport('/relatorios/vendas', token, parseSalesReport, period)
}

export function getStockReport(token: string): Promise<StockReport> {
  return getReport('/relatorios/estoque', token, parseStockReport)
}

export function getExpenseReport(
  token: string,
  period: ReportPeriod,
): Promise<ExpenseReport> {
  return getReport('/relatorios/despesas', token, parseExpenseReport, period)
}
