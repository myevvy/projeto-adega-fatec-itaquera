import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, Product, SetupData } from '../../types'

type ProductFormPageProps = {
  onNavigate: (path: AppPath) => void
  onSave: (product: Product) => void
  product?: Product
  setupData: SetupData
}

function ProductFormPage({
  onNavigate,
  onSave,
  product,
  setupData,
}: ProductFormPageProps) {
  const [saved, setSaved] = useState(false)
  const [photoName, setPhotoName] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? '',
    variety: product?.variety ?? '',
    price: product?.price ?? 0,
    cost: product?.cost ?? 0,
    stock: product?.stock ?? 0,
    minimumStock: product?.minimumStock ?? 0,
    description: product?.description ?? '',
  })

  const update = (field: keyof typeof form, value: string | number) =>
    setForm((current) => ({ ...current, [field]: value }))

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({
      ...form,
      id: product?.id ?? Date.now(),
      active: product?.active ?? true,
    })
    setSaved(true)
  }

  return (
    <main>
      <AppSidebar
        currentPage="produtos"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section>
        <button onClick={() => onNavigate('produtos')} type="button">
          ← Voltar para produtos
        </button>
        <h1>{product ? 'Editar produto' : 'Novo produto'}</h1>
        <label>
          {product ? 'Trocar foto do produto' : 'Foto do produto (opcional)'}
          <input
            accept="image/png,image/jpeg"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file && file.size > 5 * 1024 * 1024) {
                setPhotoError('A imagem deve ter no máximo 5MB.')
                setPhotoName('')
                return
              }
              setPhotoError('')
              setPhotoName(file?.name ?? '')
            }}
            type="file"
          />
          <span>
            {photoName || 'JPG ou PNG, até 5MB. Ajuda a identificar o produto na lista.'}
          </span>
          {photoError && <span role="alert">{photoError}</span>}
        </label>
        <form onSubmit={submit}>
          <label>
            Nome do produto
            <input
              onChange={(event) => update('name', event.target.value)}
              placeholder="Ex: Vinho Tinto Reserva"
              required
              value={form.name}
            />
          </label>
          <label>
            Categoria
            <input
              onChange={(event) => update('category', event.target.value)}
              placeholder="Ex: Tintos"
              required
              value={form.category}
            />
          </label>
          <label>
            Variedade
            <input
              onChange={(event) => update('variety', event.target.value)}
              placeholder="Ex: Cabernet Sauvignon"
              value={form.variety}
            />
          </label>
          <label>
            Preço de venda
            <input
              min="0"
              onChange={(event) => update('price', Number(event.target.value))}
              required
              step="0.01"
              type="number"
              value={form.price}
            />
          </label>
          <label>
            Custo de aquisição
            <input
              min="0"
              onChange={(event) => update('cost', Number(event.target.value))}
              required
              step="0.01"
              type="number"
              value={form.cost}
            />
          </label>
          <label>
            Quantidade em estoque
            <input
              min="0"
              onChange={(event) => update('stock', Number(event.target.value))}
              required
              type="number"
              value={form.stock}
            />
          </label>
          <label>
            Quantidade mínima
            <input
              min="0"
              onChange={(event) => update('minimumStock', Number(event.target.value))}
              required
              type="number"
              value={form.minimumStock}
            />
          </label>
          <label>
            Descrição (opcional)
            <textarea
              onChange={(event) => update('description', event.target.value)}
              value={form.description}
            />
          </label>
          <button disabled={Boolean(photoError)} type="submit">
            {product ? 'Salvar alterações' : 'Salvar produto'}
          </button>
        </form>
        {saved && (
          <StatusToast
            message="O produto foi adicionado ao seu estoque."
            onClose={() => setSaved(false)}
            title={product ? 'Produto atualizado com sucesso!' : 'Produto salvo com sucesso!'}
          />
        )}
      </section>
    </main>
  )
}

export default ProductFormPage
