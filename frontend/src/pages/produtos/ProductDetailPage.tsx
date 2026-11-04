import { useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import ConfirmDialog from '../../components/confirm-dialog/ConfirmDialog'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, Product, SetupData } from '../../types'

type ProductDetailPageProps = {
  onNavigate: (path: AppPath) => void
  onUpdate: (product: Product) => void
  product: Product
  setupData: SetupData
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ProductDetailPage({
  onNavigate,
  onUpdate,
  product,
  setupData,
}: ProductDetailPageProps) {
  const [confirmingDeactivation, setConfirmingDeactivation] = useState(false)
  const [deactivated, setDeactivated] = useState(false)
  const isLowStock = product.stock <= product.minimumStock

  return (
    <main>
      <AppSidebar currentPage="produtos" onNavigate={onNavigate} userName={setupData.adminName} />
      <section>
        <button onClick={() => onNavigate('produtos')} type="button">
          ← Voltar para produtos
        </button>
        <header>
          <h1>{product.name}</h1>
          <button onClick={() => onNavigate(`produtos/${product.id}/editar`)} type="button">
            Editar produto
          </button>
        </header>
        <p aria-hidden="true">▧</p>
        <p>{product.category} · {product.variety}</p>
        <dl>
          <div>
            <dt>Preço de venda</dt>
            <dd>{formatCurrency(product.price)}</dd>
          </div>
          <div>
            <dt>Custo</dt>
            <dd>{formatCurrency(product.cost)}</dd>
          </div>
        </dl>
        <section aria-label="Estoque atual">
          <p>{isLowStock ? 'Atenção' : 'Estoque em dia'}</p>
          <h2>{product.stock} un.</h2>
          <p>Mínimo cadastrado: {product.minimumStock} un.</p>
        </section>
        <button
          onClick={() =>
            onNavigate(`estoque/ajustar?produto=${product.id}`)
          }
          type="button"
        >
          Movimentar estoque
        </button>
        <p>
          <button onClick={() => setConfirmingDeactivation(true)} type="button">
            Inativar produto
          </button>
        </p>
        {confirmingDeactivation && (
          <ConfirmDialog
            description={`O produto "${product.name}" deixará de aparecer nas vendas e listagens ativas.`}
            onCancel={() => setConfirmingDeactivation(false)}
            onConfirm={() => {
              onUpdate({ ...product, active: false })
              setConfirmingDeactivation(false)
              setDeactivated(true)
            }}
            title="Inativar produto?"
          />
        )}
        {deactivated && (
          <StatusToast
            message="O produto foi inativado."
            onClose={() => setDeactivated(false)}
            title="Produto inativado"
          />
        )}
      </section>
    </main>
  )
}

export default ProductDetailPage
