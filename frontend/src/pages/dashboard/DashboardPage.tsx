import { useState } from 'react'
import AppSidebar from '../../components/app-sidebar/AppSidebar'
import type { AppPath, SaleRecord, SetupData } from '../../types'
import type { ExpenseRecord } from '../../types/financeiro'
import type { Product } from '../../types/produto'

type DashboardPageProps = {
  onNavigate: (page: AppPath) => void
  expenses: ExpenseRecord[]
  products: Product[]
  sales: SaleRecord[]
  setupData: SetupData
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  onresult:
    | ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

const getSpeechRecognition = (): SpeechRecognitionCtor | undefined => {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const formatPayment = (method: string) => {
  const upper = method.toUpperCase()
  if (upper === 'PIX') return 'PIX'
  const lower = method.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`

function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!active) return
    const handler = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [ref, active, onOutside])
}

const iconProps = {
  'aria-hidden': true,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
  viewBox: '0 0 24 24',
}

function SearchIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <rect height="12" rx="3" width="6" x="9" y="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7.5 2 7.5H4S6 15 6 9Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

type StockAlertCardProps = {
  count: number
  critical?: boolean
  onClick: () => void
  title: string
}

function StockAlertCard({
  count,
  critical = false,
  onClick,
  title,
}: StockAlertCardProps) {
  const active = count > 0
  return (
    <button
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-[#e3dfd2] bg-white p-4 text-left transition hover:bg-[#fdfcf8] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40"
      onClick={onClick}
      type="button"
    >
      <span>
        <span
          className={`block text-sm ${
            critical && active ? 'text-[#c8704d]' : 'text-[#4b4d42]'
          }`}
        >
          {title}
        </span>
        <span className="mt-2.5 block text-sm text-[#8a8678]">
          {active
            ? 'Revisar produtos com quantidade crítica'
            : 'Nenhum produto nesta situação'}
        </span>
      </span>
      <span
        className={`text-2xl font-bold leading-none ${
          active ? 'text-[#c8704d]' : 'text-[#b4b0a3]'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function DashboardPage({
  onNavigate,
  expenses,
  products,
  sales,
  setupData,
}: DashboardPageProps) {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const SpeechCtor = getSpeechRecognition()

  useClickOutside(searchRef, searchOpen, () => setSearchOpen(false))
  useClickOutside(notificationsRef, notificationsOpen, () =>
    setNotificationsOpen(false),
  )
  useEffect(() => () => recognitionRef.current?.stop(), [])

  const adminName = setupData.adminName || 'Marcos'
  const businessName = setupData.businessName || 'Adega Bom Sabor'

  const todayString = new Date().toDateString()
  const todaySales = sales.filter(
    (sale) =>
      sale.status !== 'CANCELADA' &&
      new Date(sale.createdAt).toDateString() === todayString,
  )
  const completedSales = sales.filter((sale) => sale.status !== 'CANCELADA')
  const revenueToday = todaySales.reduce((sum, sale) => sum + sale.total, 0)
  const expensesToday = expenses.filter(
    (expense) =>
      expense.active !== false &&
      new Date(`${expense.paidAt}T12:00:00`).toDateString() ===
        new Date().toDateString(),
  )

  const expensesTotal = expensesToday.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )

  const resultToday = revenueToday - expensesTotal
  const activeProducts = products.filter((product) => product.active)
  const outOfStock = activeProducts.filter((product) => product.stock === 0)
  const lowStock = activeProducts.filter(
    (product) => product.stock > 0 && product.stock <= product.minimumStock,
  )
   const alertsCount = outOfStock.length + lowStock.length

 const query = normalize(search.trim())
  const searchResults = query
    ? activeProducts
        .filter(
          (product) =>
            normalize(product.name).includes(query) ||
            normalize(product.category).includes(query),
        )
        .slice(0, 5)
    : []

  const toggleVoiceSearch = () => {
    if (!SpeechCtor) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SpeechCtor()
    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      setSearch(transcript)
      setSearchOpen(true)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }

  const formatSaleDate = (createdAt: SaleRecord['createdAt']) => {
    const date = new Date(createdAt)
    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const day =
      date.toDateString() === todayString
        ? 'Hoje'
        : date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          })
    return `${day}, ${time}`
  }

  return (
    <main className="min-h-screen bg-[#faf8f2] text-[#26291f] lg:flex">
      <AppSidebar
        currentPage="dashboard"
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />

      <section className="mx-auto flex w-full max-w-md flex-col px-5 pb-28 pt-8 lg:flex-1 lg:pb-10">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
             <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ebe8dd] text-base font-medium"
            >
              {adminName.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-xs text-[#6f6b60]">{businessName}</p>
              <h1 className="text-lg font-bold leading-tight">
                Olá, {adminName}
              </h1>
            </div>
          </div>

  <div className="relative" ref={notificationsRef}>
            <button
              aria-expanded={notificationsOpen}
              aria-label="Notificações"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#26291f] transition hover:bg-[#ebe8dd] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40"
              onClick={() => setNotificationsOpen((open) => !open)}
              type="button"
            >
              <BellIcon />
              {alertsCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[#faf8f2] bg-[#c8704d]" />
              )}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-[#e3dfd2] bg-white p-4 shadow-[0_8px_24px_rgba(38,41,31,0.12)]"
                role="dialog"
                aria-label="Notificações"
              >
                {alertsCount === 0 ? (
                  <p className="text-sm text-[#6f6b60]">
                    Tudo certo por aqui. Nenhum alerta de estoque.
                  </p>
                ) : (
                  <>
                    <ul className="space-y-2 text-sm">
                      {outOfStock.length > 0 && (
                        <li className="text-[#c8704d]">
                          {pluralize(
                            outOfStock.length,
                            'produto zerado',
                            'produtos zerados',
                          )}
                        </li>
                      )}
                      {lowStock.length > 0 && (
                        <li>
                          {pluralize(
                            lowStock.length,
                            'produto com estoque baixo',
                            'produtos com estoque baixo',
                          )}
                        </li>
                      )}
                    </ul>
                    <button
                      className="mt-3 w-full rounded-xl bg-[#3b4a2b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f3b22]"
                      onClick={() => {
                        setNotificationsOpen(false)
                        onNavigate('estoque')
                      }}
                      type="button"
                    >
                      Ver estoque
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Busca */}
        <div className="relative mt-5" ref={searchRef}>
          <label className="sr-only" htmlFor="dashboard-search">
            Buscar produto
          </label>
          <div className="flex items-center gap-3 rounded-xl bg-[#ebe8dd] px-4 py-3 text-[#6f6b60] transition focus-within:ring-2 focus-within:ring-[#3b4a2b]/30">
            <SearchIcon />
            <input
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[#26291f] outline-none placeholder:text-[#8a8678]"
              id="dashboard-search"
              onChange={(event) => {
                setSearch(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSearch('')
                  setSearchOpen(false)
                }
              }}
              placeholder="Buscar produto..."
              type="search"
              value={search}
            />
            {SpeechCtor && (
              <button
                aria-label={listening ? 'Parar busca por voz' : 'Buscar por voz'}
                aria-pressed={listening}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40 ${
                  listening
                    ? 'bg-[#c8704d] text-white motion-safe:animate-pulse'
                    : 'text-[#26291f] hover:bg-black/5'
                }`}
                onClick={toggleVoiceSearch}
                type="button"
              >
                <MicIcon />
              </button>
            )}
          </div>

          {searchOpen && query && (
            <div className="absolute inset-x-0 top-14 z-20 overflow-hidden rounded-2xl border border-[#e3dfd2] bg-white shadow-[0_8px_24px_rgba(38,41,31,0.12)]">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-[#eee9dc]">
                  {searchResults.map((product) => {
                    const empty = product.stock === 0
                    const low = !empty && product.stock <= product.minimumStock
                    return (
                      <li key={product.id}>
                        <button
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#faf8f2]"
                          onClick={() => {
                            setSearchOpen(false)
                            onNavigate('estoque')
                          }}
                          type="button"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {product.name}
                            </span>
                            <span className="block text-xs text-[#6f6b60]">
                              {product.category}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 text-sm font-semibold ${
                              empty || low ? 'text-[#c8704d]' : ''
                            }`}
                          >
                            {empty ? 'Zerado' : `${product.stock} un.`}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-[#6f6b60]" role="status">
                  Nenhum produto encontrado para “{search.trim()}”.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Vendas de hoje */}
        <section
          aria-label="Vendas de hoje"
          className="mt-5 rounded-2xl bg-[#3b4a2b] px-5 py-5 text-white"
        >
          <p className="text-sm text-white/70">Vendas de hoje</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            {formatCurrency(revenueToday)}
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9cc177]" />
            {pluralize(
              todaySales.length,
              'venda realizada',
              'vendas realizadas',
            )}
          </p>
        </section>

        {/* Visão geral */}
        <section aria-labelledby="daily-summary" className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" id="daily-summary">
              Visão geral
            </h2>
            <button
              className="text-sm text-[#4b4d42] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40"
              onClick={() => onNavigate('financeiro')}
              type="button"
            >
              Ver relatório
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl border border-[#e3dfd2] bg-white p-4"
              title="Vendas menos despesas do dia; não inclui o custo dos produtos vendidos."
            >
              <p className="text-sm text-[#4b4d42]">Lucro bruto</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  resultToday < 0 ? 'text-[#c8704d]' : ''
                }`}
              >
                {formatCurrency(resultToday)}
              </p>
              <p className="mt-2 text-xs text-[#8a8678]">
                Faturamento: {formatCurrency(revenueToday)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e3dfd2] bg-white p-4">
              <p className="text-sm text-[#4b4d42]">Despesas</p>
              <p className="mt-2 text-2xl font-bold text-[#c8704d]">
                {formatCurrency(expensesTotal)}
              </p>
              <p className="mt-2 text-xs text-[#8a8678]">No dia de hoje</p>
            </div>
          </div>

          <div
            aria-labelledby="stock-alerts"
            className="mt-3 space-y-3"
            role="group"
          >
            <h3 className="sr-only" id="stock-alerts">
              Atenção ao estoque
            </h3>
            <StockAlertCard
              count={lowStock.length}
              onClick={() => onNavigate('estoque')}
              title="Estoque baixo"
            />
            <StockAlertCard
              count={outOfStock.length}
              critical
              onClick={() => onNavigate('estoque')}
              title="Produto zerado"
            />
          </div>
        </section>

        {/* Últimas vendas */}
        <section aria-labelledby="recent-sales" className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" id="recent-sales">
              Últimas vendas
            </h2>
            <button
              className="text-sm text-[#4b4d42] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40"
              onClick={() => onNavigate('vendas')}
              type="button"
            >
              Ver tudo
            </button>
          </div>

          {completedSales.length > 0 ? (
            <ul className="mt-3 divide-y divide-[#e3dfd2] overflow-hidden rounded-2xl border border-[#e3dfd2] bg-white">
              {completedSales.slice(0, 3).map((sale, index) => {
                const itemCount = sale.items.reduce(
                  (count, item) => count + item.quantity,
                  0,
                )
                return (
                  <li
                    className="flex items-center gap-3 px-4 py-4"
                    key={sale.id}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebe8dd] text-xs font-medium text-[#4b4d42]"
                    >
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold">
                        Venda #{completedSales.length - index}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6f6b60]">
                        {formatSaleDate(sale.createdAt)} ·{' '}
                        {sale.items.length
                          ? pluralize(itemCount, 'item', 'itens')
                          : 'Itens não detalhados'}{' '}
                        · {formatPayment(sale.paymentMethod)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[15px] font-semibold">
                      {formatCurrency(sale.total)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-3 rounded-2xl border border-dashed border-[#d6d1c0] bg-white px-4 py-6 text-center text-sm text-[#6f6b60]">
              Nenhuma venda registrada. Crie uma nova venda para testar.
            </p>
          )}
        </section>

        {/* Nova venda */}
        <div className="sticky bottom-20 z-10 mt-8 lg:bottom-6">
          <button
            className="flex w-full items-center gap-4 rounded-2xl bg-[#1c1d18] px-5 py-4 text-left text-white shadow-[0_8px_20px_rgba(28,29,24,0.25)] transition hover:bg-black active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b] focus-visible:ring-offset-2"
            onClick={() => onNavigate('nova-venda')}
            type="button"
          >
            <PlusIcon />
            <span>
              <strong className="block text-base font-semibold">
                Nova Venda
              </strong>
              <span className="block text-xs text-white/60">
                Registrar em poucos segundos
              </span>
            </span>
          </button>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
