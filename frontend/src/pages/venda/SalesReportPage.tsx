import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Category = 'Todos' | 'Tintos' | 'Brancos' | 'Espumantes'
type PaymentMethod = 'Dinheiro' | 'PIX' | 'Cartão'

type Product = {
  id: number
  name: string
  price: number
  volume: string
  category: Exclude<Category, 'Todos'>
}

type NewSalePageProps = {
  onBack?: () => void
  onFinish?: () => void
  // Troque por chamada ao seu service ao confirmar a venda
  onConfirm?: (sale: {
    items: { productId: number; quantity: number }[]
    discount: number
    payment: PaymentMethod
    total: number
  }) => Promise<void> | void
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Vinho Tinto Reserva', price: 48, volume: '750ml', category: 'Tintos' },
  { id: 2, name: 'Vinho Branco Seco', price: 39.9, volume: '750ml', category: 'Brancos' },
  { id: 3, name: 'Espumante Brut', price: 65, volume: '750ml', category: 'Espumantes' },
  { id: 4, name: 'Vinho Tinto Suave', price: 29.9, volume: '750ml', category: 'Tintos' },
]

const CATEGORIES: Category[] = ['Todos', 'Tintos', 'Brancos', 'Espumantes']
const PAYMENTS: PaymentMethod[] = ['Dinheiro', 'PIX', 'Cartão']

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/* ---------- Ícones ---------- */
const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

const BackIcon = () => (
  <svg className="size-5" {...iconProps}>
    <path d="m15 18-6-6 6-6" />
  </svg>
)
const SearchIcon = () => (
  <svg className="size-4" {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)
const MicIcon = () => (
  <svg className="size-5" {...iconProps}>
    <rect height="12" rx="3" width="6" x="9" y="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
)
const CheckIcon = () => (
  <svg className="size-12 sm:size-14" {...iconProps} strokeWidth={1.6}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)
const DiscountIcon = () => (
  <svg className="size-4" {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 15 6-6" />
    <circle cx="9.5" cy="9.5" r=".6" />
    <circle cx="14.5" cy="14.5" r=".6" />
  </svg>
)
const PaymentIcon = ({ method }: { method: PaymentMethod }) => {
  if (method === 'Dinheiro')
    return (
      <svg className="size-5" {...iconProps}>
        <rect height="12" rx="2" width="18" x="3" y="6" />
        <circle cx="12" cy="12" r="2.2" />
      </svg>
    )
  if (method === 'PIX')
    return (
      <svg className="size-5" {...iconProps}>
        <path d="m12 3 9 9-9 9-9-9z" />
        <path d="m9 12 3-3 3 3-3 3z" />
      </svg>
    )
  return (
    <svg className="size-5" {...iconProps}>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="M3 10h18" />
    </svg>
  )
}

/* ---------- Seletor de quantidade ---------- */
function QuantityStepper({
  quantity,
  onChange,
  label,
}: {
  quantity: number
  onChange: (next: number) => void
  label: string
}) {
  const btn =
    'grid size-9 place-items-center rounded-lg text-lg text-[#39452d] transition hover:bg-[#e4e8dc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]'

  return (
    <div className="flex h-10 w-28 shrink-0 items-center justify-between rounded-xl bg-[#efefe9] px-0.5 sm:w-32">
      <button
        aria-label={`Diminuir quantidade de ${label}`}
        className={btn}
        onClick={() => onChange(quantity - 1)}
        type="button"
      >
        −
      </button>
      <span aria-live="polite" className="text-sm font-semibold text-[#2b3025]">
        {quantity}
      </span>
      <button
        aria-label={`Aumentar quantidade de ${label}`}
        className={btn}
        onClick={() => onChange(quantity + 1)}
        type="button"
      >
        +
      </button>
    </div>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#e8e8e0] bg-white p-4 ${className}`}>
      {children}
    </div>
  )
}

/* ---------- Página ---------- */
function NewSalePage({ onBack, onFinish, onConfirm }: NewSalePageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('Todos')
  const [cart, setCart] = useState<Record<number, number>>({})
  const [discountInput, setDiscountInput] = useState<string | null>(null)
  const [payment, setPayment] = useState<PaymentMethod | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState<{
    total: number
    payment: PaymentMethod
    items: number
  } | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return PRODUCTS.filter(
      (p) =>
        (category === 'Todos' || p.category === category) &&
        p.name.toLowerCase().includes(term),
    )
  }, [search, category])

  const setQuantity = (id: number, quantity: number) =>
    setCart((current) => {
      const next = { ...current }
      if (quantity <= 0) delete next[id]
      else next[id] = quantity
      return next
    })

  const cartItems = PRODUCTS.filter((p) => cart[p.id]).map((p) => ({
    product: p,
    quantity: cart[p.id],
  }))
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cartItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0)
  const discount = Math.min(
    Math.max(Number((discountInput ?? '0').replace(',', '.')) || 0, 0),
    subtotal,
  )
  const total = subtotal - discount
  const canConfirm = itemCount > 0 && payment !== null && !submitting

  const confirm = async () => {
    if (!canConfirm || !payment) return
    setSubmitting(true)
    try {
      await onConfirm?.({
        items: cartItems.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        discount,
        payment,
        total,
      })
      setRegistered({ total, payment, items: itemCount })
    } finally {
      setSubmitting(false)
    }
  }

  const resetSale = () => {
    setCart({})
    setDiscountInput(null)
    setPayment(null)
    setSearch('')
    setCategory('Todos')
    setRegistered(null)
  }

  /* ----- Tela de sucesso ----- */
  if (registered) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#fbfaf5] px-5 py-10">
        <section className="flex w-full max-w-md flex-col items-center text-center">
          <div className="grid size-24 place-items-center rounded-full bg-[#dfe6d3] text-[#4f6139] sm:size-28">
            <CheckIcon />
          </div>
          <h1 className="mt-8 text-2xl font-bold tracking-tight text-[#2b3025] sm:text-3xl">
            Venda registrada!
          </h1>
          <p className="mt-4 text-xl font-bold text-[#2b3025]">{currency(registered.total)}</p>
          <p className="mt-4 text-sm leading-relaxed text-[#747a6d]">
            Pagamento via {registered.payment} · {registered.items}{' '}
            {registered.items === 1 ? 'item' : 'itens'}
            <br />
            Estoque atualizado automaticamente
          </p>

          <button
            className="mt-12 h-12 w-full rounded-xl bg-[#39452d] text-sm font-semibold text-white transition hover:bg-[#2f3a25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
            onClick={resetSale}
            type="button"
          >
            Fazer outra venda
          </button>
          <button
            className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-[#747a6d] transition hover:text-[#39452d]"
            onClick={onFinish}
            type="button"
          >
            Voltar ao início
          </button>
        </section>
      </main>
    )
  }

  /* ----- Resumo (reutilizado no mobile e no desktop) ----- */
  const summary = (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#2b3025]">Resumo da venda</h2>
        <span className="text-xs text-[#858a80]">
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {cartItems.length ? (
        <ul className="mt-3 space-y-2">
          {cartItems.map(({ product, quantity }) => (
            <li className="flex justify-between gap-3 text-sm text-[#343a2f]" key={product.id}>
              <span>
                {quantity}× {product.name}
              </span>
              <span className="shrink-0 font-semibold">
                {currency(quantity * product.price)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#858a80]">Adicione produtos para iniciar a venda.</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[#eff0eb] pt-3 text-xs text-[#747a6d]">
        <span className="flex items-center gap-2">
          <DiscountIcon />
          Adicionar desconto
        </span>
        <label className="flex items-center gap-1">
          <span className="sr-only">Valor do desconto em reais</span>
          R$
          <input
            className="w-16 rounded-md bg-transparent text-right outline-none focus:bg-[#f4f4ee]"
            inputMode="decimal"
            onChange={(e) => setDiscountInput(e.target.value)}
            placeholder="0,00"
            value={discountInput ?? ''}
          />
        </label>
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-[#eff0eb] pt-3">
        <span className="text-sm font-bold text-[#2b3025]">Total</span>
        <strong className="text-2xl font-bold tracking-tight text-[#2b3025]">
          {currency(total)}
        </strong>
      </div>
    </Card>
  )

  const paymentSection = (
    <section aria-labelledby="pagamento-titulo">
      <h2 className="text-base font-semibold text-[#2b3025]" id="pagamento-titulo">
        Forma de pagamento
      </h2>
      <p className="mt-1 text-xs text-[#747a6d]">
        Selecione uma opção para registrar a venda.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2.5" role="radiogroup">
        {PAYMENTS.map((method) => {
          const selected = payment === method
          return (
            <button
              aria-checked={selected}
              className={`relative flex h-20 flex-col justify-between rounded-xl border p-3 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d] ${
                selected
                  ? 'border-[#39452d] bg-[#eef1e7] text-[#2b3025]'
                  : 'border-[#e8e8e0] bg-white text-[#343a2f] hover:border-[#c9cfbf]'
              }`}
              key={method}
              onClick={() => setPayment(method)}
              role="radio"
              type="button"
            >
              <PaymentIcon method={method} />
              <span className="font-medium">{method}</span>
              <span
                className={`absolute right-3 top-3 size-4 rounded-full border ${
                  selected ? 'border-[#39452d] bg-[#39452d] ring-2 ring-inset ring-white' : 'border-[#cfd3c8]'
                }`}
              />
            </button>
          )
        })}
      </div>
    </section>
  )

  const confirmBar = (
    <div className="space-y-2 text-center">
      <p className="text-xs text-[#747a6d]">
        {itemCount === 0
          ? 'Adicione ao menos um produto.'
          : !payment
            ? 'Escolha o pagamento e confirme abaixo.'
            : 'Tudo pronto. Confirme a venda.'}
      </p>
      <button
        className="h-12 w-full rounded-xl bg-[#39452d] text-sm font-semibold text-white transition hover:bg-[#2f3a25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d] disabled:cursor-not-allowed disabled:bg-[#d9dbd2] disabled:text-[#7c8176]"
        disabled={!canConfirm}
        onClick={confirm}
        type="button"
      >
        {submitting ? 'Registrando…' : `Confirmar venda · ${currency(total)}`}
      </button>
    </div>
  )

  return (
    <main className="min-h-dvh bg-[#fbfaf5] text-[#2b3025]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col lg:max-w-6xl">
        {/* Cabeçalho */}
        <header className="flex items-center gap-2 px-5 pb-2 pt-5 lg:px-8 lg:pt-8">
          <button
            aria-label="Voltar"
            className="-ml-2 grid size-9 place-items-center rounded-lg transition hover:bg-[#efefe9]"
            onClick={onBack}
            type="button"
          >
            <BackIcon />
          </button>
          <h1 className="text-base font-bold lg:text-xl">Nova Venda</h1>
        </header>

        <div className="flex-1 px-5 pb-32 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8 lg:px-8 lg:pb-10">
          {/* Coluna: busca + produtos */}
          <section aria-label="Produtos">
            <div className="mt-2 flex gap-2">
              <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-[#efefe9] px-3 text-[#747a6d] focus-within:ring-2 focus-within:ring-[#39452d]">
                <SearchIcon />
                <span className="sr-only">Buscar produto pelo nome</span>
                <input
                  className="w-full bg-transparent text-sm text-[#2b3025] outline-none placeholder:text-[#8a8f82]"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar produto pelo nome..."
                  type="search"
                  value={search}
                />
              </label>
              <button
                aria-label="Buscar por voz"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-[#1d1f1a] text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
                type="button"
              >
                <MicIcon />
              </button>
            </div>

            <div
              className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
              role="tablist"
            >
              {CATEGORIES.map((item) => (
                <button
                  aria-selected={category === item}
                  className={`h-8 shrink-0 rounded-full px-3.5 text-xs font-medium transition ${
                    category === item
                      ? 'bg-[#39452d] text-white'
                      : 'bg-white text-[#4b5143] ring-1 ring-[#e8e8e0] hover:ring-[#c9cfbf]'
                  }`}
                  key={item}
                  onClick={() => setCategory(item)}
                  role="tab"
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <ul className="mt-2 divide-y divide-[#ecece4] lg:grid lg:grid-cols-2 lg:gap-x-6 lg:divide-y-0">
              {filtered.map((product) => {
                const quantity = cart[product.id] ?? 0
                return (
                  <li
                    className="flex items-center justify-between gap-3 py-3.5 lg:border-b lg:border-[#ecece4]"
                    key={product.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2b3025]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#747a6d]">
                        {currency(product.price)} / un · {product.volume}
                      </p>
                    </div>
                    {quantity > 0 ? (
                      <QuantityStepper
                        label={product.name}
                        onChange={(next) => setQuantity(product.id, next)}
                        quantity={quantity}
                      />
                    ) : (
                      <button
                        className="h-10 w-28 shrink-0 rounded-xl border border-[#e0e1d8] bg-white text-xs font-semibold text-[#2b3025] transition hover:border-[#39452d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d] sm:w-32"
                        onClick={() => setQuantity(product.id, 1)}
                        type="button"
                      >
                        + Adicionar
                      </button>
                    )}
                  </li>
                )
              })}
              {!filtered.length && (
                <li className="col-span-2 py-10 text-center text-sm text-[#858a80]">
                  Nenhum produto encontrado.
                </li>
              )}
            </ul>
          </section>

          {/* Coluna: resumo + pagamento + confirmar */}
          <aside className="mt-5 space-y-6 lg:sticky lg:top-8 lg:mt-2">
            {summary}
            {paymentSection}
            <div className="hidden lg:block">{confirmBar}</div>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 border-t border-[#ecece4] bg-[#fbfaf5]/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto max-w-md">{confirmBar}</div>
        </div>
      </div>
    </main>
  )
}

export default SalesReportPage
