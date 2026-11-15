import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, ExpenseRecord, SetupData } from '../../types'

type ExpenseFormPageProps = {
  categories: { id: number; name: string }[]
  onNavigate: (path: AppPath) => void
  onSave: (expense: ExpenseRecord) => Promise<void>
  setupData: SetupData
}

function ExpenseFormPage({
  categories,
  onNavigate,
  onSave,
  setupData,
}: ExpenseFormPageProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return
    setError('')
    setIsSaving(true)
    try {
      await onSave({
        id: crypto.randomUUID(),
        description: description.trim(),
        category,
        amount: numericAmount,
        paidAt,
        observation: '',
      })
      setSaved(true)
      setAmount('')
      setDescription('')
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível registrar a despesa.',
      )
    } finally {
      setIsSaving(false)
    }
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
              onChange={(event) => setCategory(event.target.value)}
              required
              value={category}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
          {categories.length === 0 && (
            <p role="status">
              Não há categorias disponíveis na resposta do backend para registrar
              uma despesa.
            </p>
          )}
          <label>
            Data do Pagamento
            <input
              onChange={(event) => setPaidAt(event.target.value)}
              required
              type="date"
              value={paidAt}
            />
          </label>
          <button disabled={isSaving || categories.length === 0} type="submit">
            {isSaving ? 'Registrando...' : 'Registrar despesa'}
          </button>
        </form>
        {error && <p role="alert">{error}</p>}
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
