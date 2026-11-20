import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import VoiceSearchButton from '../../components/voice-search/VoiceSearchButton'
import type {
  AppPath,
  CardType,
  PaymentMethod,
  Product,
  SaleRecord,
} from '../../types'

type NewSalePageProps = {
  onNavigate: (path: AppPath) => void
  onSaleCreated: (sale: SaleRecord) => Promise<void>
  onSaleCancelled: (saleId: string) => Promise<void>
  sellerName?: string
  products: Product[]
}

const PAYMENTS: PaymentMethod[] = ['Dinheiro', 'PIX', 'Cartão']

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDateTime = (iso: string) => {
  const date = new Date(iso)
  const day = date.toLocaleDateString('pt-BR')
  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${day} às ${time}`
}

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
const SmallCheckIcon = () => (
  <svg className="size-5 shrink-0" {...iconProps} strokeWidth={1.6}>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <dt className="text-[#747a6d]">{label}</dt>
      <dd className="font-medium text-[#343a2f]">{value}</dd>
    </div>
  )
}

type RegisteredSale = {
  sale: SaleRecord
  total: number
  subtotal: number
  discount: number
  payment: PaymentMethod
  cardType: CardType | null
  items: number
}

function NewSalePage({
  onNavigate,
  onSaleCreated,
  onSaleCancelled,
  sellerName,
  products,
}: NewSalePageProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [cart, setCart] = useState<Record<number, number>>({})
  const [discountInput, setDiscountInput] = useState<string | null>(null)
  const [payment, setPayment] = useState<PaymentMethod | null>(null)
  const [cardType, setCardType] = useState<CardType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [registered, setRegistered] = useState<RegisteredSale | null>(null)
  const [view, setView] = useState<'success' | 'details'>('success')
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const categories = useMemo(
    () => [
      'Todos',
      ...new Set(
        products
          .filter((product) => product.active)
          .map((product) => product.category),
      ),
    ],
    [products],
  )
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return products.filter(
      (product) =>
        product.active &&
        (category === 'Todos' || product.category === category) &&
        product.name.toLocaleLowerCase('pt-BR').includes(term),
    )
  }, [products, search, category])

  const setQuantity = (id: number, quantity: number) =>
    setCart((current) => {
      const next = { ...current }
      const product = products.find((candidate) => candidate.id === id)
      const safeQuantity = product
        ? Math.min(quantity, product.stock)
        : quantity
      if (safeQuantity <= 0) delete next[id]
      else next[id] = safeQuantity
      return next
    })

  const cartItems = products
    .filter((product) => product.active && (cart[product.id] ?? 0) > 0)
    .map((product) => ({
      product,
      quantity: cart[product.id],
    }))
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.quantity * i.product.price,
    0,
  )
  const discount = Math.min(
    Math.max(Number((discountInput ?? '0').replace(',', '.')) || 0, 0),
    subtotal,
  )
  const total = subtotal - discount
  const canConfirm =
    itemCount > 0 &&
    payment !== null &&
    (payment !== 'Cartão' || cardType !== null) &&
    !submitting &&
    cartItems.every(({ product, quantity }) => quantity <= product.stock)

  const confirm = async () => {
    if (!canConfirm || !payment) return
    setSubmitting(true)
    setError('')
    try {
      const sale: SaleRecord = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        items: cartItems.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice: product.price,
        })),
        paymentMethod: payment,
        cardType: payment === 'Cartão' ? cardType ?? undefined : undefined,
        total,
      }
      await onSaleCreated(sale)
      setRegistered({
        sale,
        total,
        subtotal,
        discount,
        payment,
        cardType,
        items: itemCount,
      })
      setView('success')
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível registrar a venda.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const cancelSale = async () => {
    if (!registered) return
    setCancelling(true)
    setCancelError('')
    try {
      await onSaleCancelled(registered.sale.id)
      setCancelled(true)
      setConfirmingCancel(false)
    } catch (cancelFailure) {
      setCancelError(
        cancelFailure instanceof Error
          ? cancelFailure.message
          : 'Não foi possível cancelar a venda.',
      )
    } finally {
      setCancelling(false)
    }
  }

  const resetSale = () => {
    setCart({})
    setDiscountInput(null)
    setPayment(null)
    setCardType(null)
    setSearch('')
    setCategory('Todos')
    setRegistered(null)
    setError('')
    setView('success')
    setConfirmingCancel(false)
    setCancelling(false)
    setCancelled(false)
    setCancelError('')
  }

  if (registered && view === 'details') {
    const { sale } = registered
    const saleLabel = sale.id.slice(0, 6).toUpperCase()
    const paymentLabel =
      registered.payment === 'Cartão' && registered.cardType
        ? `Cartão (${registered.cardType === 'CREDITO' ? 'Crédito' : 'Débito'})`
        : registered.payment

    return (
      <main className="min-h-dvh bg-[#fbfaf5] text-[#2b3025]">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-5">
          <header className="flex items-center gap-2 pb-2">
            <button
              aria-label="Voltar"
              className="-ml-2 grid size-9 place-items-center rounded-lg transition hover:bg-[#efefe9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
              onClick={() => {
                setConfirmingCancel(false)
                setView('success')
              }}
              type="button"
            >
              <BackIcon />
            </button>
            <h1 className="text-base font-bold">Detalhes da Venda</h1>
          </header>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Venda #{saleLabel}</h2>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  cancelled
                    ? 'bg-[#efefe9] text-[#747a6d]'
                    : 'bg-[#39452d] text-white'
                }`}
              >
                {cancelled ? 'Cancelada' : 'Concluída'}
              </span>
            </div>
            <dl className="mt-3 space-y-1.5 border-t border-[#eff0eb] pt-3">
              <InfoRow label="Data e hora" value={formatDateTime(sale.createdAt)} />
              <InfoRow label="Pagamento" value={paymentLabel} />
              {sellerName && <InfoRow label="Vendedor" value={sellerName} />}
            </dl>
          </section>

          <section aria-labelledby="itens-titulo" className="mt-6 border-t border-[#eff0eb] pt-5">
            <h2 className="text-base font-bold" id="itens-titulo">
              Itens ({sale.items.length})
            </h2>
            <ul className="mt-3 divide-y divide-[#ecece4]">
              {sale.items.map((item) => (
                <li
                  className="flex items-center gap-3 py-3"
                  key={`${item.productId}-${item.name}`}
                >
                  <div aria-hidden className="size-6 shrink-0 rounded-md bg-[#dfe6d3]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#747a6d]">
                      {item.quantity} un. × {currency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {currency(item.quantity * item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-3 border-t border-[#eff0eb] pt-4">
            <dl className="space-y-1.5">
              <InfoRow label="Subtotal" value={currency(registered.subtotal)} />
              <InfoRow label="Desconto" value={currency(registered.discount)} />
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-[#eff0eb] pt-3">
              <span className="text-sm font-bold">Total</span>
              <strong className="text-2xl font-bold tracking-tight">
                {currency(registered.total)}
              </strong>
            </div>
            {cancelled && (
              <p className="mt-2 text-[11px] text-[#858a80]">
                Valor histórico da venda cancelada.
              </p>
            )}
          </section>

          <div className="mt-auto pt-10">
            {cancelError && (
              <p className="mb-3 text-center text-sm text-red-700" role="alert">
                {cancelError}
              </p>
            )}

            {cancelled ? (
              <div className="space-y-4">
                <div
                  className="flex items-start gap-3 rounded-xl bg-[#dfe6d3] p-4 text-[#39452d]"
                  role="status"
                >
                  <SmallCheckIcon />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold">
                      Venda #{saleLabel} cancelada com sucesso.
                    </p>
                    <p className="mt-0.5 text-[#4f6139]">
                      Estoque restaurado: {registered.items}{' '}
                      {registered.items === 1
                        ? 'unidade devolvida'
                        : 'unidades devolvidas'}
                      .
                    </p>
                  </div>
                </div>
                <button
                  className="h-12 w-full rounded-xl bg-[#39452d] text-sm font-semibold text-white transition hover:bg-[#2f3a25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
                  onClick={() => onNavigate('vendas')}
                  type="button"
                >
                  Voltar ao histórico
                </button>
              </div>
            ) : confirmingCancel ? (
              <div className="space-y-3 text-center">
                <p className="text-sm font-semibold">Cancelar esta venda?</p>
                <p className="text-xs text-[#747a6d]">
                  Os itens voltarão ao estoque. Essa ação não pode ser desfeita.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    className="h-12 rounded-xl border border-[#e0e1d8] bg-white text-sm font-semibold transition hover:border-[#39452d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d] disabled:opacity-50"
                    disabled={cancelling}
                    onClick={() => setConfirmingCancel(false)}
                    type="button"
                  >
                    Manter venda
                  </button>
                  <button
                    className="h-12 rounded-xl bg-[#b3362c] text-sm font-semibold text-white transition hover:bg-[#9b2e25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b3362c] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={cancelling}
                    onClick={cancelSale}
                    type="button"
                  >
                    {cancelling ? 'Cancelando…' : 'Cancelar venda'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="mx-auto block rounded-lg px-3 py-2 text-sm font-semibold text-[#c0392b] transition hover:bg-[#f6e9e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c0392b]"
                onClick={() => setConfirmingCancel(true)}
                type="button"
              >
                Cancelar venda
              </button>
            )}
          </div>
        </div>
      </main>
    )
  }

  if (registered) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#fbfaf5] px-5 py-10">
        <section className="flex w-full max-w-md flex-col items-center text-center">
          <div
            className={`grid size-24 place-items-center rounded-full sm:size-28 ${
              cancelled
                ? 'bg-[#efefe9] text-[#747a6d]'
                : 'bg-[#dfe6d3] text-[#4f6139]'
            }`}
          >
            <CheckIcon />
          </div>
          <h1 className="mt-8 text-2xl font-bold tracking-tight text-[#2b3025] sm:text-3xl">
            {cancelled ? 'Venda cancelada' : 'Venda registrada!'}
          </h1>
          <p className="mt-4 text-xl font-bold text-[#2b3025]">{currency(registered.total)}</p>
          <p className="mt-4 text-sm leading-relaxed text-[#747a6d]">
            Pagamento via {registered.payment}
            {registered.payment === 'Cartão' && registered.cardType
              ? ` (${registered.cardType === 'CREDITO' ? 'Crédito' : 'Débito'})`
              : ''}{' '}
            · {registered.items}{' '}
            {registered.items === 1 ? 'item' : 'itens'}
            <br />
            {cancelled
              ? 'Estoque restaurado automaticamente'
              : 'Estoque atualizado automaticamente'}
          </p>

          <button
            className="mt-12 h-12 w-full rounded-xl bg-[#39452d] text-sm font-semibold text-white transition hover:bg-[#2f3a25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
            onClick={resetSale}
            type="button"
          >
            Fazer outra venda
          </button>
          <button
            className="mt-3 h-12 w-full rounded-xl border border-[#e0e1d8] bg-white text-sm font-semibold text-[#2b3025] transition hover:border-[#39452d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
            onClick={() => setView('details')}
            type="button"
          >
            Ver detalhes da venda
          </button>
          <button
            className="mt-5 rounded-lg px-3 py-2 text-sm font-semibold text-[#747a6d] transition hover:text-[#39452d]"
            onClick={() => onNavigate('vendas')}
            type="button"
          >
            Voltar ao início
          </button>
        </section>
      </main>
    )
  }

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
              onClick={() => {
                setPayment(method)
                if (method !== 'Cartão') setCardType(null)
              }}
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
      {payment === 'Cartão' && (
        <label className="mt-4 block text-sm font-medium text-[#2b3025]">
          Tipo do cartão
          <select
            className="mt-2 h-12 w-full rounded-xl border border-[#e8e8e0] bg-white px-3 text-sm text-[#343a2f] outline-none focus:border-[#39452d] focus:ring-2 focus:ring-[#39452d]/20"
            onChange={(event) => {
              const value = event.target.value
              setCardType(value === 'CREDITO' || value === 'DEBITO' ? value : null)
            }}
            required
            value={cardType ?? ''}
          >
            <option value="">Selecione crédito ou débito</option>
            <option value="CREDITO">Crédito</option>
            <option value="DEBITO">Débito</option>
          </select>
        </label>
      )}
    </section>
  )

  const confirmBar = (
    <div className="space-y-2 text-center">
      <p className="text-xs text-[#747a6d]">
        {itemCount === 0
          ? 'Adicione ao menos um produto.'
          : !payment
            ? 'Escolha o pagamento e confirme abaixo.'
            : payment === 'Cartão' && !cardType
              ? 'Selecione crédito ou débito.'
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
        <header className="flex items-center gap-2 px-5 pb-2 pt-5 lg:px-8 lg:pt-8">
          <button
            aria-label="Voltar"
            className="-ml-2 grid size-9 place-items-center rounded-lg transition hover:bg-[#efefe9]"
            onClick={() => onNavigate('vendas')}
            type="button"
          >
            <BackIcon />
          </button>
          <h1 className="text-base font-bold lg:text-xl">Nova Venda</h1>
        </header>

        <div className="flex-1 px-5 pb-32 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8 lg:px-8 lg:pb-10">
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
              <VoiceSearchButton
                buttonClassName="grid size-11 shrink-0 place-items-center rounded-full bg-[#1d1f1a] text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d]"
                label="Buscar produto por voz"
                onTranscript={setSearch}
              >
                <MicIcon />
              </VoiceSearchButton>
            </div>

            <div
              className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
              role="tablist"
            >
              {categories.map((item) => (
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
                        {currency(product.price)} / un ·{' '}
                        {product.variety || product.category}
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
                        className="h-10 w-28 shrink-0 rounded-xl border border-[#e0e1d8] bg-white text-xs font-semibold text-[#2b3025] transition hover:border-[#39452d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39452d] disabled:cursor-not-allowed disabled:opacity-50 sm:w-32"
                        disabled={product.stock <= 0}
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

          <aside className="mt-5 space-y-6 lg:sticky lg:top-8 lg:mt-2">
            {summary}
            {paymentSection}
            {error && (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
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

export default NewSalePage
