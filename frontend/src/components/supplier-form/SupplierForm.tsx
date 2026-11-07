import { useState, type FormEvent } from 'react'
import type { Supplier } from '../../types/fornecedor'

type SupplierFormProps = {
  onCancel: () => void
  onSave: (supplier: Supplier) => void
  supplier?: Supplier
}

function SupplierForm({ onCancel, onSave, supplier }: SupplierFormProps) {
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

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({
      ...form,
      id: supplier?.id ?? crypto.randomUUID(),
      active: supplier?.active ?? true,
      purchases: supplier?.purchases ?? [],
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Os dados serão salvos apenas neste navegador.</p>
      <label>
        Nome fantasia *
        <input
          autoComplete="organization"
          onChange={(event) => updateField('name', event.target.value)}
          required
          value={form.name}
        />
      </label>
      <label>
        Razão social
        <input
          onChange={(event) => updateField('legalName', event.target.value)}
          value={form.legalName}
        />
      </label>
      <label>
        CNPJ
        <input
          onChange={(event) => updateField('cnpj', event.target.value)}
          value={form.cnpj}
        />
      </label>
      <label>
        Telefone *
        <input
          autoComplete="tel"
          onChange={(event) => updateField('phone', event.target.value)}
          required
          type="tel"
          value={form.phone}
        />
      </label>
      <label>
        E-mail
        <input
          autoComplete="email"
          onChange={(event) => updateField('email', event.target.value)}
          type="email"
          value={form.email}
        />
      </label>
      <label>
        Endereço
        <input
          autoComplete="street-address"
          onChange={(event) => updateField('address', event.target.value)}
          value={form.address}
        />
      </label>
      <label>
        Cidade
        <input
          onChange={(event) => updateField('city', event.target.value)}
          value={form.city}
        />
      </label>
      <label>
        Estado
        <input
          maxLength={2}
          onChange={(event) => updateField('state', event.target.value.toUpperCase())}
          value={form.state}
        />
      </label>
      <label>
        Observações
        <textarea
          onChange={(event) => updateField('description', event.target.value)}
          value={form.description}
        />
      </label>
      <button type="submit">{supplier ? 'Salvar alterações' : 'Cadastrar fornecedor'}</button>
      <button onClick={onCancel} type="button">Cancelar</button>
    </form>
  )
}

export default SupplierForm
