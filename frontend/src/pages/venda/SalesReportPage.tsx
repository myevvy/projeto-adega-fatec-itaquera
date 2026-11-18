import { useMemo, useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import VoiceSearchButton from '../../components/voice-search/VoiceSearchButton'
import type { AppPath } from '../../types/sistema'
import type { SetupData } from '../../types/usuario'
import type { PaymentMethod, Product, SaleRecord } from '../../types'

type NewSalePageProps = {
  onNavigate: (page: AppPath) => void
  onSaleCreated: (sale: SaleRecord) => Promise<void>
  products: Product[]
  setupData: SetupData
}

type CompletedSale = {
  total: number
  paymentMethod: PaymentMethod
  itemCount: number
}

const HOME_PAGE = 'vendas' as AppPath

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

const SearchIcon = () => (
  <svg {...iconProps} className="size-5 shrink-0 text-[#747a6d]">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const BackIcon = () => (
  <svg {...iconProps} className="size-5" strokeWidth={2.2}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const CashIcon = () => (
  <svg {...iconProps} className="size-5">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.2" />
  </svg>
)

const PixIcon = () => (
  <svg {...iconProps} className="size-5">
    <path d="M12 3 21 12l-9 9-9-9z" />
    <path d="m9 12 3-3 3 3-3 3z" />
  </svg>
)

const CardIcon = () => (
  <svg {...iconProps} className="size-5">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
)

const DiscountIcon = () => (
  <svg {...iconProps} className="size-4 shrink-0 text-[#747a6d]">
    <circle cx="12" cy="12" r="9" />
    <path d="m9 15 6-6" />
    <circle cx="9.5" cy="9.5" r=".6" />
    <circle cx="14.5" cy="14.5" r=".6" />
  </svg>
)

const CheckIcon = () => (
  <svg {...iconProps} className="size-12 text-[#5f8a47]" strokeWidth={2.4}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

const paymentOptions: { method: PaymentMethod; icon: () => JSX.Element }[] = [
  { method: 'Dinheiro' as PaymentMethod, icon: CashIcon },
  { method: 'PIX' as PaymentMethod, icon: PixIcon },
  { method: 'Cartão' as PaymentMethod, icon: CardIcon },
]

function NewSalePage({ onNavigate, onSaleCreated, products, setupData }: NewSalePageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const categories = useMemo(
    () => ['Todos', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR'))
        const matchesCategory = category === 'Todos' || product.category === category
        return product.active && matchesSearch && matchesCategory
      }),
    [category, products, search],
  )

  const saleItems = products.filter(
    (product) => product.active && quantities[product.id] > 0,
  )
  const total = saleItems.reduce(
    (sum, product) => sum + product.price * quantities[product.id],
    0,
  )
  const itemCount = saleItems.reduce(
    (sum, product) => sum + quantities[product.id],
    0,
  )

  const adjustQuantity = (productId: number, amount: number) => {
    setQuantities((current) => {
      const next = (current[productId] ?? 0) + amount
      const product = products.find((candidate) => candidate.id === productId)
      if (amount > 0 && (!product || next > product.stock)) {
        return current
      }
      if (next <= 0) {
        const updated = { ...current }
        delete updated[productId]
        return updated
      }
      return { ...current, [productId]: next }
    })
  }

  const confirmSale = async () => {
    if (!paymentMethod || saleItems.length === 0) {
      return
    }

    setError('')
    setIsSaving(true)
    try {
      await onSaleCreated({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        items: saleItems.map((product) => ({
          productId: product.id,
          name: product.name,
          quantity: quantities[product.id],
          unitPrice: product.price,
        })),
        paymentMethod,
        total,
      })
      setCompletedSale({ total, paymentMethod, itemCount })
      setQuantities({})
      setPaymentMethod('')
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível registrar a venda.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const startNewSale = () => {
    setCompletedSale(null)
    setSearch('')
    setCategory('Todos')
    setError('')
  }

  const canConfirm = !isSaving && itemCount > 0 && Boolean(paymentMethod)

  const confirmButton = (
    <div className="space-y-2">
      {!canConfirm && !isSaving && (
        <p className="text-center text-xs text-[#747a6d]">
          {itemCount === 0
            ? 'Adicione produtos para continuar.'
            : 'Escolha o pagamento e confirme abaixo.'}
        </p>
      )}
      {error && (
        <p role="alert" className="text-center text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <button
        className="h-12 w-full rounded-xl bg-[#3b4a2c] text-sm font-semibold text-white transition hover:bg-[#2f3b23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b4a2c] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-[#747a6d]"
        disabled={!canConfirm}
        onClick={() => void confirmSale()}
        type="button"
      >
        {isSaving ? 'Registrando venda...' : `Confirmar venda · ${formatCurrency(total)}`}
      </button>
    </div>
  )

  if (completedSale) {
    return (
      <main className="flex min-h-dvh bg-[#faf8f2] text-stone-900">
        <div className="hidden lg:block">
          <AppSidebar
            currentPage="vendas/nova-venda"
            onNavigate={onNavigate}
            userName={setupData.adminName}
          />
        </div>
        <section className="flex flex-1 items-center justify-center px-6 py-10">
          <div
            role="status"
            className="flex w-full max-w-md flex-col items-center text-center sm:rounded-3xl sm:bg-white sm:px-10 sm:py-14 sm:shadow-sm sm:ring-1 sm:ring-stone-200"
          >
            <div className="flex size-24 items-center justify-center rounded-full bg-[#e6eddd]">
              <CheckIcon />
            </div>
            <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
              Venda registrada!
            </h1>
            <p className="mt-5 text-xl font-bold">{formatCurrency(completedSale.total)}</p>
            <p className="mt-4 text-sm text-[#747a6d]">
              Pagamento via {completedSale.paymentMethod} · {completedSale.itemCount}{' '}
              {completedSale.itemCount === 1 ? 'item' : 'itens'}
            </p>
            <p className="text-sm text-[#747a6d]">Estoque atualizado automaticamente</p>

            <button
              className="mt-10 h-12 w-full rounded-xl bg-[#3b4a2c] text-sm font-semibold text-white transition hover:bg-[#2f3b23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b4a2c]"
              onClick={startNewSale}
              type="button"
            >
              Fazer outra venda
            </button>
            <button
              className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-[#5a6153] transition hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-[#3b4a2c]"
              onClick={() => onNavigate(HOME_PAGE)}
              type="button"
            >
              Voltar ao início
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh bg-[#faf8f2] text-stone-900">
      <div className="hidden lg:block">
        <AppSidebar
          currentPage="vendas/nova-venda"
          onNavigate={onNavigate}
          userName={setupData.adminName}
        />
      </div>

      <section className="mx-auto w-full max-w-6xl flex-1 px-4 pb-36 pt-6 sm:px-6 lg:pb-10 lg:pt-10">
        <header className="flex items-center gap-3">
          <button
            aria-label="Voltar ao histórico de vendas"
            className="-ml-2 flex size-9 items-center justify-center rounded-full transition hover:bg-stone-200/70 focus-visible:outline-2 focus-visible:outline-[#3b4a2c]"
            onClick={() => onNavigate('vendas')}
            type="button"
          >
            <BackIcon />
          </button>
          <h1 className="text-lg font-bold sm:text-2xl">Nova Venda</h1>
        </header>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_26rem] xl:gap-10">
          {/* Coluna de produtos */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-stone-200/60 px-3 focus-within:ring-2 focus-within:ring-[#3b4a2c]">
                <SearchIcon />
                <span className="sr-only">Buscar produto pelo nome</span>
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#747a6d]"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar produto pelo nome..."
                  type="search"
                  value={search}
                />
              </label>
              <VoiceSearchButton label="Buscar produto por voz" onTranscript={setSearch} />
            </div>

            <div
              aria-label="Filtrar por categoria"
              className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
              role="group"
            >
              {categories.map((option) => (
                <button
                  aria-pressed={category === option}
                  className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-medium text-[#5a6153] shadow-sm ring-1 ring-stone-200 transition hover:ring-stone-300 aria-pressed:bg-[#3b4a2c] aria-pressed:text-white aria-pressed:ring-[#3b4a2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b4a2c]"
                  key={option}
                  onClick={() => setCategory(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <ul className="mt-4 divide-y divide-stone-200/80">
              {visibleProducts.length === 0 && (
                <li className="py-10 text-center text-sm text-[#747a6d]">
                  Nenhum produto encontrado.
                </li>
              )}
              {visibleProducts.map((product) => {
                const quantity = quantities[product.id] ?? 0
                return (
                  <li
                    className="flex items-center justify-between gap-3 py-3.5"
                    key={product.id}
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold sm:text-base">
                        {product.name}
                      </strong>
                      <p className="mt-0.5 text-xs text-[#747a6d] sm:text-sm">
                        {formatCurrency(product.price)} / un
                      </p>
                    </div>

                    {quantity > 0 ? (
                      <div className="flex h-10 w-28 shrink-0 items-center justify-between rounded-xl bg-stone-200/60 px-1 sm:w-32">
                        <button
                          aria-label={`Remover uma unidade de ${product.name}`}
                          className="flex size-8 items-center justify-center rounded-lg text-lg transition hover:bg-stone-300/60 focus-visible:outline-2 focus-visible:outline-[#3b4a2c]"
                          onClick={() => adjustQuantity(product.id, -1)}
                          type="button"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold tabular-nums">{quantity}</span>
                        <button
                          aria-label={`Adicionar uma unidade de ${product.name}`}
                          className="flex size-8 items-center justify-center rounded-lg text-lg transition hover:bg-stone-300/60 focus-visible:outline-2 focus-visible:outline-[#3b4a2c] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                          disabled={quantity >= product.stock}
                          onClick={() => adjustQuantity(product.id, 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="h-10 w-28 shrink-0 rounded-xl bg-white text-sm font-medium shadow-sm ring-1 ring-stone-200 transition hover:ring-stone-400 focus-visible:outline-2 focus-visible:outline-[#3b4a2c] disabled:cursor-not-allowed disabled:text-stone-400 disabled:hover:ring-stone-200 sm:w-32"
                        disabled={product.stock === 0}
                        onClick={() => adjustQuantity(product.id, 1)}
                        type="button"
                      >
                        {product.stock === 0 ? 'Sem estoque' : '+ Adicionar'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <section
              aria-labelledby="sale-summary"
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:p-5"
            >
              <div className="flex items-baseline justify-between text-xs text-[#747a6d] sm:text-sm">
                <h2 className="font-medium text-stone-800" id="sale-summary">
                  Resumo da venda
                </h2>
                <p>
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                </p>
              </div>

              {saleItems.length === 0 ? (
                <p className="py-4 text-sm text-[#747a6d]">Nenhum produto adicionado.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {saleItems.map((product) => (
                    <li className="flex justify-between gap-3" key={product.id}>
                      <span className="min-w-0 truncate">
                        {quantities[product.id]}× {product.name}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">
                        {formatCurrency(product.price * quantities[product.id])}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 text-xs text-[#747a6d]">
                <span className="flex items-center gap-2">
                  <DiscountIcon />
                  Adicionar desconto
                </span>
                <span className="tabular-nums">R$ 0,00</span>
              </div>

              <p className="mt-4 flex items-baseline justify-between">
                <strong className="text-base font-bold">Total</strong>
                <strong className="text-xl font-bold tabular-nums sm:text-2xl">
                  {formatCurrency(total)}
                </strong>
              </p>
            </section>

            <fieldset>
              <legend className="text-base font-bold sm:text-lg">Forma de pagamento</legend>
              <p className="mt-1 text-xs text-[#747a6d]">
                Selecione uma opção para registrar a venda.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                {paymentOptions.map(({ method, icon: Icon }) => {
                  const selected = paymentMethod === method
                  return (
                    <button
                      aria-pressed={selected}
                      className="relative flex h-24 flex-col justify-between rounded-xl bg-white p-3 text-left ring-1 ring-stone-200 transition hover:ring-stone-400 aria-pressed:bg-[#e6eddd] aria-pressed:ring-2 aria-pressed:ring-[#3b4a2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b4a2c]"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      type="button"
                    >
                      <span className="flex items-start justify-between">
                        <Icon />
                        <span
                          aria-hidden="true"
                          className={`flex size-4 items-center justify-center rounded-full border ${
                            selected ? 'border-[#3b4a2c]' : 'border-stone-300'
                          }`}
                        >
                          {selected && <span className="size-2 rounded-full bg-[#3b4a2c]" />}
                        </span>
                      </span>
                      <span className="text-center text-sm font-medium">{method}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="hidden lg:block">{confirmButton}</div>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-[#faf8f2]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6 lg:hidden">
        <div className="mx-auto max-w-2xl">{confirmButton}</div>
      </div>
    </main>
  )
}

export default NewSalePage