import { useState, type FormEvent, type ReactNode } from 'react'
import type { Supplier } from '../../types/fornecedor'

type SupplierFormProps = {
  onCancel: () => void
  onDone?: (supplier: Supplier) => void
  onSave: (supplier: Supplier) => Promise<Supplier>
  supplier?: Supplier
}

const inputClass =
  'w-full rounded-xl border border-line bg-field px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm text-muted">{label}</span>
      {children}
    </label>
  )
}

function GroupTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
      {children}
    </h2>
  )
}

function SupplierForm({ onCancel, onDone, onSave, supplier }: SupplierFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [savedSupplier, setSavedSupplier] = useState<Supplier | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: supplier?.name ?? '',
    legalName: supplier?.legalName ?? '',
    cnpj: supplier?.cnpj ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    city: supplier?.city ?? '',
    state: supplier?.state ?? '',
    description: supplier?.description ?? '',
  })

  const isEditing = Boolean(supplier)
  const isLocked = isSaving || savedSupplier !== null

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (savedSupplier) return
    setError('')
    setIsSaving(true)
    try {
      const saved = await onSave({
        ...form,
        id: supplier?.id ?? crypto.randomUUID(),
        active: supplier?.active ?? true,
        purchases: supplier?.purchases ?? [],
      })
      setSavedSupplier(saved)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível salvar o fornecedor.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const legalFields = (
    <>
      <Field label="Razão social">
        <input
          className={inputClass}
          onChange={(event) => updateField('legalName', event.target.value)}
          value={form.legalName}
        />
      </Field>
      <Field label="CNPJ">
        <input
          className={inputClass}
          inputMode="numeric"
          onChange={(event) => updateField('cnpj', event.target.value)}
          placeholder="00.000.000/0000-00"
          value={form.cnpj}
        />
      </Field>
    </>
  )

  const addressFields = (
    <>
      <Field label="Endereço">
        <input
          autoComplete="street-address"
          className={inputClass}
          onChange={(event) => updateField('address', event.target.value)}
          value={form.address}
        />
      </Field>
      <div className="grid grid-cols-[1fr_6rem] gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label="Cidade">
          <input
            className={inputClass}
            onChange={(event) => updateField('city', event.target.value)}
            value={form.city}
          />
        </Field>
        <Field label="Estado">
          <input
            className={`${inputClass} uppercase`}
            maxLength={2}
            onChange={(event) =>
              updateField('state', event.target.value.toUpperCase())
            }
            value={form.state}
          />
        </Field>
      </div>
    </>
  )

  const descriptionField = (
    <Field label="Observações">
      <textarea
        className={`${inputClass} min-h-24 resize-y`}
        onChange={(event) => updateField('description', event.target.value)}
        value={form.description}
      />
    </Field>
  )

  return (
    <form
      className="flex min-h-[calc(100vh-11rem)] flex-col sm:min-h-0"
      onSubmit={handleSubmit}
    >
      <fieldset
        className="min-w-0 space-y-6 border-0 p-0"
        disabled={isLocked}
      >
        <legend className="sr-only">
          {isEditing ? 'Editar fornecedor' : 'Novo fornecedor'}
        </legend>

        <p className="text-xs text-muted">Os dados são salvos no banco de dados.</p>

        <section className="space-y-4">
          <GroupTitle>Identificação</GroupTitle>
          <Field label={isEditing ? 'Nome fantasia *' : 'Nome do fornecedor *'}>
            <input
              autoComplete="organization"
              className={inputClass}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Ex: Vinhos SA"
              required
              value={form.name}
            />
          </Field>
          {isEditing && legalFields}
        </section>

        <section className="space-y-4 border-t border-line pt-6">
          <GroupTitle>Contato</GroupTitle>
          <Field label="Telefone *">
            <input
              autoComplete="tel"
              className={inputClass}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="(00) 00000-0000"
              required
              type="tel"
              value={form.phone}
            />
          </Field>
          <Field label={isEditing ? 'E-mail' : 'E-mail (opcional)'}>
            <input
              autoComplete="email"
              className={inputClass}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="contato@fornecedor.com"
              type="email"
              value={form.email}
            />
          </Field>
        </section>

        {isEditing ? (
          <section className="space-y-4 border-t border-line pt-6">
            <GroupTitle>Endereço</GroupTitle>
            {addressFields}
            {descriptionField}
          </section>
        ) : (
          <details className="group border-t border-line pt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-md py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden">
              Mais informações (opcional)
              <span
                aria-hidden="true"
                className="text-muted transition group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <div className="mt-4 space-y-4">
              {legalFields}
              {addressFields}
              {descriptionField}
            </div>
          </details>
        )}
      </fieldset>

      {error && (
        <p
          className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-950/50 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-auto space-y-3 pt-8">
        {savedSupplier && (
          <div
            className="flex items-center gap-3 rounded-lg bg-soft px-4 py-3 text-sm font-medium"
            role="status"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 12.5 9.5 18 20 6" />
            </svg>
            {isEditing
              ? `Alterações de ${savedSupplier.name} salvas.`
              : 'Fornecedor cadastrado com sucesso.'}
          </div>
        )}

        {savedSupplier ? (
          <button
            className="w-full rounded-xl bg-brand py-4 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[.99]"
            onClick={() => (onDone ? onDone(savedSupplier) : onCancel())}
            type="button"
          >
            {isEditing ? 'Voltar ao fornecedor' : 'Voltar aos fornecedores'}
          </button>
        ) : (
          <>
            <button
              className="w-full rounded-xl bg-brand py-4 text-sm font-semibold text-brand-ink transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Salvar fornecedor'}
            </button>
            <button
              className="w-full rounded-md py-2 text-sm font-medium text-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={onCancel}
              type="button"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </form>
  )
}

export default SupplierForm
