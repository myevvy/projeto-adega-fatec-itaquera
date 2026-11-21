import { useEffect, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { Supplier } from '../../types/fornecedor'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'

type SupplierDetailPageProps = {
  onDelete: (supplierId: string) => Promise<void>
  onNavigate: (path: AppPath) => void
  setupData: SetupData
  supplier: Supplier
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR')

function SupplierDetailPage({
  onDelete,
  onNavigate,
  setupData,
  supplier,
}: SupplierDetailPageProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const purchasesTotal = supplier.purchases.reduce((total, purchase) => total + purchase.total, 0)

  useEffect(() => {
    if (!confirmDelete) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) setConfirmDelete(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirmDelete, isDeleting])

  const handleDeactivate = async () => {
    setError('')
    setIsDeleting(true)
    try {
      await onDelete(supplier.id)
      setConfirmDelete(false)
      onNavigate('fornecedores')
    } catch (deleteError) {
      setConfirmDelete(false)
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível desativar o fornecedor.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const dataRows = [
    { label: 'Telefone', value: supplier.phone || '—' },
    { label: 'E-mail', value: supplier.email || '—' },
    { label: 'Endereço', value: supplier.address || '—' },
    {
      label: 'Cidade / Estado',
      value: [supplier.city, supplier.state].filter(Boolean).join(' / ') || '—',
    },
    { label: 'Observações', value: supplier.description || '—' },
  ]

  return (
    <div className="min-h-screen bg-page font-sans text-ink antialiased lg:flex">
      <AppSidebar
        currentPage="fornecedores"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10">
        <div className="flex items-center gap-3 border-b border-line pb-4 sm:border-0 sm:pb-0">
          <button
            aria-label="Voltar para fornecedores"
            className="inline-flex items-center gap-2 rounded-md p-1 text-sm text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => onNavigate('fornecedores')}
            type="button"
          >
            <span aria-hidden="true" className="text-lg sm:text-base">←</span>
            <span className="hidden sm:inline">Voltar para fornecedores</span>
          </button>
          <p className="flex-1 pr-8 text-center text-base font-semibold sm:hidden">
            Detalhes do Fornecedor
          </p>
        </div>

        <header className="mt-6 flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-soft sm:h-20 sm:w-20"
          >
            <svg
              className="h-7 w-7 sm:h-9 sm:w-9"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 24 24"
            >
              <rect height="18" rx="2" width="14" x="5" y="3" />
              <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
            </svg>
          </div>

          <div className="mt-3 min-w-0 flex-1 sm:mt-0">
            <p className="hidden text-xs font-medium uppercase tracking-wide text-muted sm:block">
              Detalhes do fornecedor
            </p>
            <h1 className="break-words text-2xl font-semibold sm:mt-1 sm:text-3xl">
              {supplier.name}
            </h1>
            <p className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  supplier.active
                    ? 'bg-soft text-ink'
                    : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                }`}
              >
                {supplier.active ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>

          <div className="mt-5 flex w-full flex-col gap-3 sm:mt-0 sm:w-auto sm:flex-row">
            <button
              className="rounded-xl bg-soft px-5 py-3 text-sm font-semibold transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={() => onNavigate(`fornecedores/${supplier.id}/editar`)}
              type="button"
            >
              Editar fornecedor
            </button>
            <button
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[.99]"
              onClick={() => onNavigate('compras/nova')}
              type="button"
            >
              Nova compra
            </button>
          </div>
        </header>

        {error && (
          <p
            className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-950/50 dark:text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <section
            aria-labelledby="supplier-data-title"
            className="lg:col-span-2 lg:self-start lg:rounded-2xl lg:border lg:border-line lg:bg-card lg:p-6"
          >
            <h2 className="text-base font-semibold sm:text-lg" id="supplier-data-title">
              Dados cadastrais
            </h2>
            <dl className="mt-3 divide-y divide-line border-y border-line lg:border-0">
              {dataRows.map((row) => (
                <div className="py-3" key={row.label}>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">
                    {row.label}
                  </dt>
                  <dd className="mt-0.5 break-words text-sm">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="purchase-history-title"
            className="lg:col-span-3 lg:rounded-2xl lg:border lg:border-line lg:bg-card lg:p-6"
          >
            <h2
              className="text-base font-semibold sm:text-lg"
              id="purchase-history-title"
            >
              Histórico de compras
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted">Total de compras</p>
                <p className="mt-0.5 text-lg font-bold sm:text-xl">
                  {supplier.purchases.length}{' '}
                  {supplier.purchases.length === 1 ? 'compra' : 'compras'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total movimentado</p>
                <p className="mt-0.5 text-lg font-bold sm:text-xl">
                  {formatCurrency(purchasesTotal)}
                </p>
              </div>
            </div>

            {supplier.purchases.length === 0 ? (
              <p className="mt-5 rounded-xl bg-soft px-4 py-8 text-center text-sm text-muted">
                Nenhuma compra demonstrativa registrada para este fornecedor.
              </p>
            ) : (
              <>

                <ul className="mt-5 divide-y divide-line border-y border-line sm:hidden">
                  {supplier.purchases.map((purchase) => (
                    <li className="py-3" key={purchase.id}>
                      <strong className="block text-sm font-semibold">
                        {formatCurrency(purchase.total)}
                      </strong>
                      <span className="mt-0.5 block text-xs text-muted">
                        {formatDate(purchase.date)} ·{' '}
                        {purchase.itemCount
                          ? `${purchase.itemCount} itens`
                          : 'Itens não informados'}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 hidden overflow-x-auto rounded-xl border border-line sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-soft text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-3 font-medium" scope="col">Data</th>
                        <th className="px-4 py-3 font-medium" scope="col">Itens</th>
                        <th className="px-4 py-3 text-right font-medium" scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {supplier.purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="whitespace-nowrap px-4 py-3">
                            {formatDate(purchase.date)}
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {purchase.itemCount || 'Não informado'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                            {formatCurrency(purchase.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="mt-8">
          <button
            className="w-full rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold text-red-700 transition hover:border-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line sm:w-auto dark:text-red-400"
            disabled={!supplier.active}
            onClick={() => setConfirmDelete(true)}
            type="button"
          >
            Desativar fornecedor
          </button>
        </div>
      </main>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => {
            if (!isDeleting) setConfirmDelete(false)
          }}
        >
          <div
            aria-labelledby="desativar-titulo"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 className="text-lg font-semibold" id="desativar-titulo">
              Desativar fornecedor?
            </h2>
            <p className="mt-1 break-words text-sm text-muted">{supplier.name}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                autoFocus
                className="rounded-xl bg-soft px-5 py-3 text-sm font-semibold transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting}
                onClick={() => void handleDeactivate()}
                type="button"
              >
                {isDeleting ? 'Desativando…' : 'Desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierDetailPage
