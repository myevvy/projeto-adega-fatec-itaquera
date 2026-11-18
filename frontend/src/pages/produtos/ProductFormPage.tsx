import { useEffect, useState, type FormEvent } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, Product, SetupData } from '../../types'

type ProductFormPageProps = {
  categories: string[]
  onNavigate: (path: AppPath) => void
  onSave: (product: Product, image?: File) => Promise<void>
  product?: Product
  setupData: SetupData
}

type DictationField = 'name' | 'description'

const labelClass = 'mb-1.5 block text-sm text-[#4A4A42]'
const inputClass =
  'h-12 w-full rounded-xl border border-[#E3E0D5] bg-white px-4 text-base text-[#2B2B26] ' +
  'placeholder:text-[#A5A59B] outline-none transition ' +
  'focus:border-[#3B4A2E] focus:ring-2 focus:ring-[#3B4A2E]/20'

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult:
    | ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null
  start: () => void
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

const getRecognition = () => {
  if (typeof window === 'undefined') return undefined
  const speechWindow = window as SpeechWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

const speechSupported = Boolean(getRecognition())

function MicButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`flex size-11 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4A2E] ${
        active
          ? 'bg-[#3B4A2E] text-white'
          : 'bg-[#E9E8E0] text-[#4A4A42] hover:bg-[#DEDDD3]'
      }`}
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="12" rx="3" width="6" x="9" y="2" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v4" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function ProductFormPage({
  categories,
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
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [listening, setListening] = useState<DictationField | null>(null)
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

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  const update = (field: keyof typeof form, value: string | number) => {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  const dictate = (field: DictationField) => {
    const Recognition = getRecognition()
    if (!Recognition) return
    const recognition = new Recognition()
    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.onstart = () => setListening(field)
    recognition.onend = () => setListening(null)
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      setForm((current) => ({ ...current, [field]: `${current[field]} ${text}`.trim() }))
    }
    recognition.start()
  }

  const handlePhoto = (file?: File) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setPhotoError('A imagem deve ter no máximo 5MB.')
      setPhotoName('')
      setPhoto(undefined)
      setPhotoPreview('')
      return
    }
    setPhotoError('')
    setPhotoName(file?.name ?? '')
    setPhoto(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : '')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveError('')
    setSaved(false)
    setIsSaving(true)
    try {
      await onSave(
        {
          ...form,
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          id: product?.id ?? Date.now(),
          active: product?.active ?? true,
        },
        photo,
      )
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
    <div className="min-h-dvh bg-[#FAF8F3] text-[#2B2B26] lg:flex">
      <div className="hidden lg:block lg:shrink-0">
        <AppSidebar
          currentPage="produtos"
          onNavigate={onNavigate}
          userName={setupData.adminName}
        />
      </div>

      <main className="flex min-w-0 flex-1 justify-center">
        <form
          className="flex min-h-dvh w-full max-w-2xl flex-col"
          onSubmit={submit}
        >
          <div className="flex-1 px-5 pb-6 pt-6 sm:px-8 sm:pt-10 lg:px-10">
            <header className="flex items-center gap-3">
              <button
                aria-label="Voltar para produtos"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EFEEE6] text-[#2B2B26] transition hover:bg-[#E3E2D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4A2E]"
                onClick={() => onNavigate('produtos')}
                type="button"
              >
                <svg aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold sm:text-2xl">
                {product ? 'Editar produto' : 'Novo produto'}
              </h1>
            </header>

            {!product && (
              <div className="mt-6 flex flex-col items-center text-center">
                <label className="group flex cursor-pointer flex-col items-center gap-2">
                  <span className="relative flex size-28 items-center justify-center overflow-hidden rounded-3xl bg-[#DDE6D3] text-[#1F2A17] transition group-hover:bg-[#D2DDC7] group-focus-within:ring-2 group-focus-within:ring-[#3B4A2E] sm:size-32">
                    {photoPreview ? (
                      <img alt="Pré-visualização do produto" className="size-full object-cover" src={photoPreview} />
                    ) : (
                      <svg aria-hidden className="size-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 3 7.2 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.2L15 3H9Zm3 5.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                      </svg>
                    )}
                  </span>
                  <span className="text-xs text-[#2B2B26] sm:text-sm">
                    {photoName || 'Adicionar foto do produto'}
                  </span>
                  <input
                    accept="image/png,image/jpeg"
                    className="sr-only"
                    onChange={(event) => handlePhoto(event.target.files?.[0])}
                    type="file"
                  />
                </label>
                <p className="mt-1 text-xs text-[#8A8A80]">JPG ou PNG, até 5MB (opcional)</p>
                {photoError && (
                  <p className="mt-1 text-sm text-red-700" role="alert">
                    {photoError}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4">
              <div className="col-span-2">
                <label className={labelClass} htmlFor="product-name">
                  Nome do produto
                </label>
                <div className="flex items-center gap-3">
                  <input
                    className={inputClass}
                    id="product-name"
                    onChange={(event) => update('name', event.target.value)}
                    placeholder="Ex: Vinho Tinto Reserva"
                    required
                    value={form.name}
                  />
                  {speechSupported && (
                    <MicButton
                      active={listening === 'name'}
                      label="Ditar nome do produto"
                      onClick={() => dictate('name')}
                    />
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <label className={labelClass} htmlFor="product-category">
                  Categoria
                </label>
                <input
                  className={inputClass}
                  id="product-category"
                  list="product-categories"
                  onChange={(event) => update('category', event.target.value)}
                  placeholder="Ex: Tintos"
                  required
                  value={form.category}
                />
                <datalist id="product-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                <p className="mt-1.5 text-xs text-[#8A8A80]">
                  Use uma categoria já cadastrada e ativa no sistema.
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="product-price">
                  Preço de venda
                </label>
                <input
                  className={inputClass}
                  id="product-price"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => update('price', Number(event.target.value))}
                  placeholder="R$ 0,00"
                  required
                  step="0.01"
                  type="number"
                  value={form.price || ''}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="product-cost">
                  Custo de aquisição
                </label>
                <input
                  className={inputClass}
                  id="product-cost"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => update('cost', Number(event.target.value))}
                  placeholder="R$ 0,00"
                  required
                  step="0.01"
                  type="number"
                  value={form.cost || ''}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="product-stock">
                  Qtd. em estoque
                </label>
                <input
                  className={inputClass}
                  id="product-stock"
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => update('stock', Number(event.target.value))}
                  placeholder="0"
                  required
                  type="number"
                  value={form.stock}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="product-min-stock">
                  Qtd. mínima
                </label>
                <input
                  className={inputClass}
                  id="product-min-stock"
                  inputMode="numeric"
                  min="0"
                  onChange={(event) => update('minimumStock', Number(event.target.value))}
                  placeholder="0"
                  required
                  type="number"
                  value={form.minimumStock}
                />
              </div>

              <div className="col-span-2">
                <label className={labelClass} htmlFor="product-description">
                  Descrição (opcional)
                </label>
                <div className="flex items-start gap-3">
                  <textarea
                    className={`${inputClass} h-auto min-h-12 resize-y py-3.5 leading-snug`}
                    id="product-description"
                    onChange={(event) => update('description', event.target.value)}
                    placeholder={
                      speechSupported ? 'Toque no microfone pra ditar' : 'Descreva o produto'
                    }
                    rows={2}
                    value={form.description}
                  />
                  {speechSupported && (
                    <MicButton
                      active={listening === 'description'}
                      label="Ditar descrição"
                      onClick={() => dictate('description')}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="sticky bottom-0 border-t border-[#E3E0D5] bg-[#FAF8F3]/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:px-8 lg:px-10">
            {saved && (
              <div
                className="mb-3 flex items-center gap-2 rounded-xl bg-[#DDE6D3] px-4 py-3 text-sm font-medium text-[#2B3A20]"
                role="status"
              >
                <svg aria-hidden className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {product ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.'}
              </div>
            )}
            {saveError && (
              <p
                className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {saveError}
              </p>
            )}
            <button
              className="h-12 w-full rounded-xl bg-[#3B4A2E] text-base font-medium text-white transition hover:bg-[#2F3C24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B4A2E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={Boolean(photoError) || isSaving}
              type="submit"
            >
              {isSaving
                ? 'Salvando...'
                : product
                  ? 'Salvar alterações'
                  : 'Salvar produto'}
            </button>
          </footer>
        </form>
      </main>
    </div>
  )
}

export default ProductFormPage
