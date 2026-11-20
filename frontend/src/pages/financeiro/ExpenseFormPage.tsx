import { useEffect, useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, ExpenseRecord, SetupData } from '../../types'
import type { ExpenseCategoryOption } from '../../types/financeiro'

function getLocalDateInputValue(date: Date) {
  const localDate = new Date(date)
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
  return localDate.toISOString().slice(0, 10)
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

type ExpenseFormPageProps = {
  categories: ExpenseCategoryOption[]
  onCreateCategory: (
    name: string,
    type: string,
  ) => Promise<ExpenseCategoryOption>
  onNavigate: (path: AppPath) => void
  onSave: (expense: ExpenseRecord) => Promise<void>
  setupData: SetupData
}

type SavedExpense = {
  description: string
  amount: number
  category: string
}

const fieldClass =
  'w-full min-w-0 appearance-none rounded-xl border border-line bg-field px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60 sm:text-sm'

const labelClass = 'block text-sm text-muted'

function ExpenseFormPage({
  categories,
  onCreateCategory,
  onNavigate,
  onSave,
  setupData,
}: ExpenseFormPageProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [paidAt, setPaidAt] = useState(getLocalDateInputValue(new Date()))
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [saved, setSaved] = useState(false)
  const [lastSaved, setLastSaved] = useState<SavedExpense | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!saved) return
    const timeout = window.setTimeout(() => onNavigate('financeiro'), 2000)
    return () => window.clearTimeout(timeout)
  }, [onNavigate, saved])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return
    const selectedCategory = categories.find(
      (option) => option.id.toString() === category,
    )
    if (!selectedCategory) {
      setError('Selecione uma categoria existente.')
      return
    }
    setError('')
    setIsSaving(true)
    try {
      const trimmedDescription = description.trim()
      await onSave({
        id: crypto.randomUUID(),
        description: trimmedDescription,
        category: selectedCategory.name,
        categoryId: selectedCategory.id,
        amount: numericAmount,
        paidAt,
        observation: '',
      })
      setLastSaved({
        description: trimmedDescription,
        amount: numericAmount,
        category: selectedCategory.name,
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

  const createCategory = async () => {
    setCategoryError('')
    setIsCreatingCategory(true)
    try {
      const created = await onCreateCategory(
        newCategoryName.trim(),
        newCategoryType,
      )
      setCategory(created.id.toString())
      setNewCategoryName('')
      setCreatingCategory(false)
    } catch (createError) {
      setCategoryError(
        createError instanceof Error
          ? createError.message
          : 'Não foi possível criar a categoria.',
      )
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const categoryTypes = [...new Set(categories.map((option) => option.type))]

  return (
    <main className="min-h-dvh bg-page font-sans text-ink antialiased lg:flex">
      <AppSidebar
        currentPage="financeiro"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto w-full min-w-0 max-w-xl flex-1 px-4 pb-32 pt-5 sm:px-8 sm:pb-28 sm:pt-10">
        <button
          className="-ml-1 inline-flex items-center gap-2 rounded-md px-1 py-2 text-sm text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={() => onNavigate('financeiro')}
          type="button"
        >
          <span aria-hidden="true">←</span> Voltar para financeiro
        </button>

        <div className="mt-2 rounded-3xl bg-card sm:mt-4 sm:border sm:border-line sm:p-8 sm:shadow-sm">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Registrar Despesa
          </h1>
          <p className="mt-2 text-sm text-muted">
            Mantenha as despesas da sua adega em dia.
          </p>

          <form className="mt-6 space-y-5" onSubmit={submit}>
            <label className="block cursor-text rounded-2xl bg-soft px-4 py-4 sm:px-5">
              <span className={labelClass}>Valor</span>
              <span className="mt-1 flex items-baseline gap-2">
                <span className="text-base font-medium text-muted">R$</span>
                <input
                  className="w-full min-w-0 bg-transparent text-3xl font-bold tracking-tight text-ink placeholder:text-muted/50 focus:outline-none sm:text-4xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  inputMode="decimal"
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
                onChange={(event) => {
                  if (event.target.value === '__create_category__') {
                    setCreatingCategory(true)
                    setNewCategoryType(categoryTypes[0] ?? '')
                    setCategoryError('')
                    return
                  }
                  setCategory(event.target.value)
                }}
                required
                value={categories.some((option) => option.id.toString() === category) ? category : ''}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
                <option value="__create_category__">+ Criar categoria...</option>
              </select>
            </label>

            {creatingCategory && (
              <div className="space-y-3 rounded-xl bg-soft p-4">
                <label className="block space-y-2">
                  <span className={labelClass}>Nome da nova categoria</span>
                  <input
                    className={fieldClass}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.preventDefault()
                    }}
                    placeholder="Ex: Manutenção"
                    value={newCategoryName}
                  />
                </label>
                <label className="block space-y-2">
                  <span className={labelClass}>Tipo da categoria</span>
                  <select
                    className={fieldClass}
                    onChange={(event) => setNewCategoryType(event.target.value)}
                    required
                    value={newCategoryType}
                  >
                    {categoryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                {categoryTypes.length === 0 && (
                  <p className="text-xs text-muted" role="status">
                    Não foi possível identificar os tipos existentes. Atualize as categorias antes de criar outra.
                  </p>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
                    disabled={
                      !newCategoryName.trim() ||
                      !newCategoryType ||
                      isCreatingCategory
                    }
                    onClick={() => void createCategory()}
                    type="button"
                  >
                    {isCreatingCategory ? 'Criando...' : 'Criar categoria'}
                  </button>
                  <button
                    className="rounded-xl px-4 py-3 text-sm text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:py-2"
                    onClick={() => {
                      setCreatingCategory(false)
                      setCategoryError('')
                    }}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
                {categoryError && (
                  <p className="text-sm text-red-700" role="alert">
                    {categoryError}
                  </p>
                )}
              </div>
            )}

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
                className={`${fieldClass} min-h-12`}
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
              disabled={isSaving}
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
      </section>

      {saved && lastSaved && (
        <div
          className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96"
        >
          <div
            aria-live="polite"
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-card p-4 shadow-lg"
            role="status"
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-soft text-brand"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Despesa registrada com sucesso!</p>
              <p className="mt-0.5 break-words text-sm text-muted">
                {lastSaved.description} · {formatCurrency(lastSaved.amount)}
              </p>
              <p className="mt-0.5 break-words text-xs text-muted">
                {lastSaved.category} · Voltando ao Financeiro…
              </p>
            </div>
            <button
              aria-label="Fechar mensagem e continuar nesta tela"
              className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={() => setSaved(false)}
              type="button"
            >
              <span aria-hidden="true" className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default ExpenseFormPage
