import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, ExpenseRecord, SetupData } from '../../types'

function getLocalDateInputValue(date: Date) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 10)
}

type ExpenseFormPageProps = {
  categories: { id: number; name: string }[]
  onNavigate: (path: AppPath) => void
  onSave: (expense: ExpenseRecord) => Promise<void>
  setupData: SetupData
}

const fieldClass =
  'w-full rounded-xl border border-line bg-field px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60'

const labelClass = 'block text-sm text-muted'

function ExpenseFormPage({
  categories,
  onNavigate,
  onSave,
  setupData,
}: ExpenseFormPageProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [paidAt, setPaidAt] = useState(getLocalDateInputValue(new Date()))
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
    <main className="min-h-screen bg-page font-sans text-ink antialiased lg:flex">
      <AppSidebar
        currentPage="financeiro"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto w-full max-w-xl flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <button
          className="inline-flex items-center gap-2 rounded-md text-sm text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={() => onNavigate('financeiro')}
          type="button"
        >
          <span aria-hidden="true">←</span> Voltar para financeiro
        </button>

        <div className="mt-4 rounded-3xl bg-card sm:border sm:border-line sm:p-8 sm:shadow-sm">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Registrar Despesa
          </h1>
          <p className="mt-2 text-sm text-muted">
            Mantenha as despesas da sua adega em dia.
          </p>

          <form className="mt-6 space-y-5" onSubmit={submit}>
            <label className="block cursor-text rounded-2xl bg-soft px-5 py-4">
              <span className={labelClass}>Valor</span>
              <span className="mt-1 flex items-baseline gap-2">
                <span className="text-base font-medium text-muted">R$</span>
                <input
                  className="w-full bg-transparent text-3xl font-bold tracking-tight text-ink placeholder:text-muted/50 focus:outline-none sm:text-4xl"
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
              </span>
            </label>

            <label className="block space-y-2">
              <span className={labelClass}>Descrição</span>
              <input
                className={fieldClass}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ex: Conta de luz, Compra de taças"
                required
                value={description}
              />
            </label>

            <label className="block space-y-2">
              <span className={labelClass}>Categoria</span>
              <select
                className={fieldClass}
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
              <p
                className="rounded-lg bg-soft px-4 py-3 text-xs text-muted"
                role="status"
              >
                Não há categorias disponíveis na resposta do backend para
                registrar uma despesa.
              </p>
            )}

            <label className="block space-y-2">
              <span className={labelClass}>Data do Pagamento</span>
              <input
                className={fieldClass}
                onChange={(event) => setPaidAt(event.target.value)}
                required
                type="date"
                value={paidAt}
              />
            </label>

            <p className="flex items-start gap-2 text-xs text-muted">
              <svg
                aria-hidden="true"
                className="mt-px h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              A despesa aparecerá nas movimentações do Financeiro.
            </p>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving || categories.length === 0}
              type="submit"
            >
              {!isSaving && <span aria-hidden="true">+</span>}
              {isSaving ? 'Registrando...' : 'Registrar despesa'}
            </button>
          </form>

          {error && (
            <p
              className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-950/50 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {saved && (
          <StatusToast
            message="A despesa foi salva no banco de dados."
            onClose={() => setSaved(false)}
            title="Despesa registrada com sucesso!"
          />
        )}
      </section>
    </main>
  )
}

export default ExpenseFormPage
