import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, Product, SetupData } from '../../types'

type StockReportPageProps = {
  onNavigate: (path: AppPath) => void
  products: Product[]
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function StockReportPage({
  onNavigate,
  products,
  setupData,
}: StockReportPageProps) {
  const activeProducts = products.filter((product) => product.active)
  const totalUnits = activeProducts.reduce(
    (total, product) => total + product.stock,
    0,
  )
  const stockCost = activeProducts.reduce(
    (total, product) => total + product.cost * product.stock,
    0,
  )
  const alerts = activeProducts.filter(
    (product) => product.stock <= product.minimumStock,
  )

  const exportReport = () => {
    const rows = [
      ['Produto', 'Categoria', 'Estoque', 'Mínimo', 'Custo unitário', 'Custo total'],
      ...activeProducts.map((product) => [
        product.name,
        product.category,
        String(product.stock),
        String(product.minimumStock),
        product.cost.toFixed(2),
        (product.stock * product.cost).toFixed(2),
      ]),
    ]
    const csv = rows
      .map((row) =>
        row.map((field) => `"${field.replaceAll('"', '""')}"`).join(';'),
      )
      .join('\n')
    const file = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'relatorio-de-estoque.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main>
      <AppSidebar
        currentPage="estoque"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <header>
          <h1>Relatório de Estoque</h1>
          <button onClick={exportReport} type="button">
            Exportar relatório
          </button>
        </header>
        <section aria-label="Resumo do estoque">
          <p>Produtos cadastrados</p>
          <strong>{activeProducts.length} itens</strong>
          <p>Unidades em estoque</p>
          <strong>{totalUnits} un.</strong>
          <p>Valor total em estoque (custo)</p>
          <strong>{formatCurrency(stockCost)}</strong>
        </section>
        <section aria-labelledby="stock-level-alerts">
          <h2 id="stock-level-alerts">Alertas de Níveis</h2>
          {alerts.length ? (
            <ul>
              {alerts.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => onNavigate(`produtos/${product.id}`)}
                    type="button"
                  >
                    <strong>{product.name}</strong>
                    <span>Mín: {product.minimumStock} un.</span>
                    <span>{product.stock} un.</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum alerta de estoque.</p>
          )}
        </section>
        <button onClick={() => onNavigate('estoque')} type="button">
          ← Voltar para estoque
        </button>
      </section>
    </main>
  )
}

export default StockReportPage
