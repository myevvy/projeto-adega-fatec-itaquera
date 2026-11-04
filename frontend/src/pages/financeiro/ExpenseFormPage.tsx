import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, ExpenseCategory, ExpenseRecord, SetupData } from '../../types'

type ExpenseFormPageProps = {
  onNavigate: (path: AppPath) => void
  onSave: (expense: ExpenseRecord) => void
  setupData: SetupData
}

const categories: ExpenseCategory[] = [
  'Fixa (contas, aluguel)',
  'Compras de fornecedores',
  'Outras despesas',
]

function ExpenseFormPage({ onNavigate, onSave, setupData }: ExpenseFormPageProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>(categories[0])
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))
  const [observation, setObservation] = useState('')
  const [saved, setSaved] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return
    onSave({
      id: crypto.randomUUID(),
      description: description.trim(),
      category,
      amount: numericAmount,
      paidAt,
      observation: observation.trim(),
    })
    setSaved(true)
    setAmount('')
    setDescription('')
    setObservation('')
  }

  return (
    <main>
      <AppSidebar
        currentPage="financeiro"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <button onClick={() => onNavigate('financeiro')} type="button">
          ← Voltar para financeiro
        </button>
        <h1>Registrar Despesa</h1>
        <form onSubmit={submit}>
          <label>
            Valor
            <span>R$</span>
            <input
              min="0.01"
              onChange={(event) => {
                setAmount(event.target.value)
                setSaved(false)
              }}
              placeholder="0,00"
              required
              step="0.01"
              type="number"
              value={amount}
            />
          </label>
          <label>
            Descrição
            <input
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex: Conta de luz, Compra de taças"
              required
              value={description}
            />
          </label>
          <label>
            Categoria
            <select
              onChange={(event) =>
                setCategory(event.target.value as ExpenseCategory)
              }
              value={category}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data do Pagamento
            <input
              onChange={(event) => setPaidAt(event.target.value)}
              required
              type="date"
              value={paidAt}
            />
          </label>
          <label>
            Observações (opcional)
            <textarea
              onChange={(event) => setObservation(event.target.value)}
              placeholder="Toque para adicionar mais detalhes..."
              value={observation}
            />
          </label>
          <button type="submit">Registrar despesa</button>
        </form>
        {saved && (
          <StatusToast
            message="A despesa foi salva no financeiro local."
            onClose={() => setSaved(false)}
            title="Despesa registrada com sucesso!"
          />
        )}
      </section>
    </main>
  )
}

export default ExpenseFormPage
