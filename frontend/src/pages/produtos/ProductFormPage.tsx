import { useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import StatusToast from '../../components/status-toast/StatusToast'
import type { AppPath, Product, SetupData } from '../../types'

type ProductFormPageProps = {
  onNavigate: (path: AppPath) => void
  onSave: (product: Product, image?: File) => Promise<void>
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
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [photo, setPhoto] = useState<File>()
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveError('')
    setIsSaving(true)
    try {
      await onSave({
      ...form,
      id: product?.id ?? Date.now(),
      active: product?.active ?? true,
      }, photo)
      setSaved(true)
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Não foi possível salvar o produto.',
      )
    } finally {
      setIsSaving(false)
    }
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
        {!product && (
          <label>
            Foto do produto (opcional)
            <input
              accept="image/png,image/jpeg"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file && file.size > 5 * 1024 * 1024) {
                  setPhotoError('A imagem deve ter no máximo 5MB.')
                  setPhotoName('')
                  setPhoto(undefined)
                  return
                }
                setPhotoError('')
                setPhotoName(file?.name ?? '')
                setPhoto(file)
              }}
              type="file"
            />
            <span>
              {photoName || 'JPG ou PNG, até 5MB. Selecione uma imagem ou deixe em branco.'}
            </span>
            <span>
              Sem seleção, uma imagem padrão será usada no envio. O backend atual
              ainda não associa o arquivo ao registro do produto.
            </span>
            {photoError && <span role="alert">{photoError}</span>}
          </label>
        )}
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
          <button disabled={Boolean(photoError) || isSaving} type="submit">
            {isSaving
              ? 'Salvando...'
              : product
                ? 'Salvar alterações'
                : 'Salvar produto'}
          </button>
        </form>
        {saveError && <p role="alert">{saveError}</p>}
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
