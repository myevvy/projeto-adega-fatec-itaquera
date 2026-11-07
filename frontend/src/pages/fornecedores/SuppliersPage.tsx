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

function SuppliersPage({ onNavigate, setupData, suppliers }: SuppliersPageProps) {
  const [search, setSearch] = useState('')
  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return suppliers.filter((supplier) =>
      `${supplier.name} ${supplier.cnpj} ${supplier.city}`
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    )
  }, [search, suppliers])

  return (
    <div>
      <AppSidebar
        currentPage="fornecedores"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <main>
        <header>
          <p>Gestão de fornecedores</p>
          <h1>Fornecedores</h1>
          <p>Consulte e organize os parceiros da sua adega.</p>
        </header>
        <section aria-label="Resumo de fornecedores">
          <p>Total cadastrados: {suppliers.length}</p>
          <p>Ativos: {suppliers.filter((supplier) => supplier.active).length}</p>
        </section>
        <section aria-labelledby="supplier-list-title">
          <h2 id="supplier-list-title">Todos os fornecedores</h2>
          <label>
            Buscar por nome, CNPJ ou cidade
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex.: Vinícola"
              type="search"
              value={search}
            />
          </label>
          <button onClick={() => onNavigate('fornecedores/novo')} type="button">
            Novo fornecedor
          </button>
          {filteredSuppliers.length === 0 ? (
            <p>Nenhum fornecedor encontrado.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Fornecedor</th>
                  <th scope="col">CNPJ</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">Cidade</th>
                  <th scope="col">Status</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.cnpj || '—'}</td>
                    <td>{supplier.phone}</td>
                    <td>{[supplier.city, supplier.state].filter(Boolean).join(' / ') || '—'}</td>
                    <td>{supplier.active ? 'Ativo' : 'Inativo'}</td>
                    <td>
                      <button
                        onClick={() => onNavigate(`fornecedores/${supplier.id}`)}
                        type="button"
                      >
                        Ver detalhes
                      </button>
                      <button
                        onClick={() => onNavigate(`fornecedores/${supplier.id}/editar`)}
                        type="button"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}

export default SuppliersPage
