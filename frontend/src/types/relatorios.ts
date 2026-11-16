export type ReportPeriod = {
  inicio: string
  fim: string
}

export type SalesReport = {
  periodo: ReportPeriod & { quantidadeDias: number }
  resumo: {
    totalVendas: number
    faturamento: number
    produtosVendidos: number
    ticketMedio: number
  }
  comparacao: {
    periodoAnterior: ReportPeriod
    totalVendas: ReportComparison
    faturamento: ReportComparison
    produtosVendidos: ReportComparison
  }
  graficos: {
    vendasPorDia: {
      data: string
      totalVendas: number
      faturamento: number
      produtosVendidos: number
    }[]
    produtosMaisVendidos: {
      produtoId: number
      produto: string
      quantidadeVendida: number
      faturamento: number
    }[]
    vendasPorFormaPagamento: {
      formaPagamento: string
      totalVendas: number
      faturamento: number
    }[]
  }
}

export type ReportComparison = {
  atual: number
  anterior: number
  diferenca: number
  variacaoPercentual: number | null
}

export type StockReport = {
  geradoEm: string
  resumo: {
    produtosCadastrados: number
    unidadesEmEstoque: number
    valorTotalEmEstoque: number
    produtosEmAlerta: number
  }
  alertas: StockReportProduct[]
  produtos: StockReportProduct[]
  estoquePorCategoria: {
    categoriaId: number
    categoria: string
    produtosCadastrados: number
    unidadesEmEstoque: number
    valorEmEstoque: number
  }[]
}

export type StockReportProduct = {
  produtoId: number
  produto: string
  categoria: string
  quantidadeEmEstoque: number
  quantidadeMinima: number
  custoUnitario: number
  valorEmEstoque: number
  statusEstoque: 'ZERADO' | 'BAIXO' | 'OK'
}

export type ExpenseReport = {
  periodo: ReportPeriod
  resumo: {
    totalLancamentos: number
    totalDespesas: number
  }
  graficos: {
    despesasPorCategoria: {
      categoriaId: number
      categoria: string
      totalLancamentos: number
      totalDespesas: number
      percentual: number
    }[]
  }
  historico: {
    id: number
    data: string
    descricao: string
    categoria: string
    valor: number
    formaPagamento: string | null
    compraId: number | null
    usuario: string
  }[]
}
