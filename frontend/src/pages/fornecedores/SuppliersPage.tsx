import { useMemo, useState } from 'react'
import type { AppPath } from '../../types/sistema'
import type { Supplier } from '../../types/fornecedor'
import type { SetupData } from '../../types/usuario'
import AppSidebar from '../../components/app-sidebar/AppSidebar'

type SuppliersPageProps = {
  onNavigate: (path: AppPath) => void
  setupData: SetupData
  suppliers: Supplier[]
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? 'bg-soft text-ink'
          : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
      }`}
    >
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )
}

function SuppliersPage({ onNavigate, setupData, suppliers }: SuppliersPageProps) {
  const [search, setSearch] = useState('')
  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return suppliers.filter((supplier) =>
      `${supplier.name} ${supplier.city}`
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    )
  }, [search, suppliers])

  const activeCount = suppliers.filter((supplier) => supplier.active).length
  const location = (supplier: Supplier) =>
    [supplier.city, supplier.state].filter(Boolean).join(' / ') || '—'

  return (
    <div className="min-h-screen bg-page font-sans text-ink antialiased lg:flex">
      <AppSidebar
        currentPage="fornecedores"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pb-10">
        {/* Cabeçalho */}
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Voltar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft text-ink transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
              onClick={() => onNavigate('dashboard')}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <div className="min-w-0">
              <p className="hidden text-xs font-medium uppercase tracking-wide text-muted sm:block">
                Gestão de fornecedores
              </p>
              <h1 className="text-xl font-semibold sm:mt-1 sm:text-3xl">
                Fornecedores
              </h1>
              <p className="text-xs text-muted sm:hidden">
                {suppliers.length} cadastrados
              </p>
              <p className="mt-1 hidden text-sm text-muted sm:block">
                Consulte e organize os parceiros da sua adega.
              </p>
            </div>
          </div>

          <button
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[.99]"
            onClick={() => onNavigate('fornecedores/novo')}
            type="button"
          >
            <span aria-hidden="true">+</span>
            <span className="sm:hidden">Novo</span>
            <span className="hidden sm:inline">Novo fornecedor</span>
          </button>
        </header>

        {/* Resumo (a partir de sm) */}
        <section
          aria-label="Resumo de fornecedores"
          className="mt-6 hidden grid-cols-2 gap-4 sm:grid lg:max-w-xl"
        >
          <article className="rounded-2xl bg-soft px-5 py-4">
            <p className="text-sm text-muted">Total cadastrados</p>
            <strong className="mt-1 block text-3xl font-bold tracking-tight">
              {suppliers.length}
            </strong>
          </article>
          <article className="rounded-2xl border border-line bg-card px-5 py-4">
            <p className="text-sm text-muted">Ativos</p>
            <strong className="mt-1 block text-3xl font-bold tracking-tight">
              {activeCount}
            </strong>
          </article>
        </section>

        {/* Lista */}
        <section aria-labelledby="supplier-list-title" className="mt-6">
          <h2 className="sr-only sm:not-sr-only sm:text-lg sm:font-semibold" id="supplier-list-title">
            Todos os fornecedores
          </h2>

          <label className="mt-3 block space-y-2">
            <span className="text-sm text-muted">Buscar por nome ou cidade</span>
            <input
              className="w-full rounded-xl border border-line bg-field px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand sm:max-w-md"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex.: Vinícola"
              type="search"
              value={search}
            />
          </label>

          {filteredSuppliers.length === 0 ? (
            <p className="mt-5 rounded-xl bg-soft px-4 py-8 text-center text-sm text-muted">
              Nenhum fornecedor encontrado.
            </p>
          ) : (
            <>
              {/* Celular: lista */}
              <ul className="mt-4 divide-y divide-line border-y border-line md:hidden">
                {filteredSuppliers.map((supplier) => (
                  <li key={supplier.id}>
                    <div className="flex items-center gap-2">
                      <button
                        className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        onClick={() => onNavigate(`fornecedores/${supplier.id}`)}
                        type="button"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <strong className="truncate text-sm font-semibold">
                              {supplier.name}
                            </strong>
                            {!supplier.active && <StatusBadge active={false} />}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {supplier.phone} · {location(supplier)}
                          </span>
                        </span>
                        <span aria-hidden="true" className="shrink-0 text-muted">
                          ›
                        </span>
                      </button>
                      <button
                        aria-label={`Editar ${supplier.name}`}
                        className="shrink-0 rounded-lg border border-line bg-field px-3 py-1.5 text-xs font-medium transition hover:bg-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        onClick={() =>
                          onNavigate(`fornecedores/${supplier.id}/editar`)
                        }
                        type="button"
                      >
                        Editar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablet e desktop: tabela */}
              <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-line bg-card md:block">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-soft text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-5 py-3 font-medium" scope="col">Fornecedor</th>
                      <th className="px-5 py-3 font-medium" scope="col">Telefone</th>
                      <th className="px-5 py-3 font-medium" scope="col">Cidade</th>
                      <th className="px-5 py-3 font-medium" scope="col">Status</th>
                      <th className="px-5 py-3 text-right font-medium" scope="col">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredSuppliers.map((supplier) => (
                      <tr className="transition hover:bg-soft/50" key={supplier.id}>
                        <td className="px-5 py-4 font-semibold">{supplier.name}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-muted">
                          {supplier.phone}
                        </td>
                        <td className="px-5 py-4 text-muted">{location(supplier)}</td>
                        <td className="px-5 py-4">
                          <StatusBadge active={supplier.active} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="whitespace-nowrap rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                              onClick={() =>
                                onNavigate(`fornecedores/${supplier.id}`)
                              }
                              type="button"
                            >
                              Ver detalhes
                            </button>
                            <button
                              className="rounded-lg border border-line bg-field px-3 py-1.5 text-xs font-medium transition hover:bg-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                              onClick={() =>
                                onNavigate(`fornecedores/${supplier.id}/editar`)
                              }
                              type="button"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default SuppliersPage