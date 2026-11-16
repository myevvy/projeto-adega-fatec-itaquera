import { useEffect, useState, type ReactNode } from 'react'
import type { AppPath } from '../../types'
import { useAuth } from '../../hooks/useAuth'

type AppSidebarProps = {
  currentPage: string
  onNavigate: (page: AppPath) => void
  userName: string
}

type IconProps = { active?: boolean }

const iconBase = {
  'aria-hidden': true,
  className: 'h-[22px] w-[22px]',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8,
  viewBox: '0 0 24 24',
}

function HomeIcon({ active }: IconProps) {
  return (
    <svg {...iconBase} fill={active ? 'currentColor' : 'none'}>
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8Z" />
    </svg>
  )
}
 
function TagIcon({ active }: IconProps) {
  return (
    <svg {...iconBase} fill={active ? 'currentColor' : 'none'}>
      <path d="M12 3 21 12l-9 9-9-9 9-9Z" />
      <circle cx="12" cy="9" r="1" fill={active ? '#faf8f2' : 'currentColor'} />
    </svg>
  )
}
 
function BoxIcon({ active }: IconProps) {
  return (
    <svg {...iconBase} fill={active ? 'currentColor' : 'none'}>
      <path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z" />
      <path d="M3 4h18v4H3z" />
      <path d="M10 12h4" stroke={active ? '#faf8f2' : 'currentColor'} />
    </svg>
  )
}
 
function ChartIcon({ active }: IconProps) {
  return (
    <svg {...iconBase} fill={active ? 'currentColor' : 'none'}>
      <rect height="9" rx="1" width="4" x="4" y="11" />
      <rect height="16" rx="1" width="4" x="10" y="4" />
      <rect height="6" rx="1" width="4" x="16" y="14" />
    </svg>
  )
}
 
function MenuIcon() {
  return (
    <svg {...iconBase}>
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  )
}
 
function TruckIcon() {
  return (
    <svg {...iconBase}>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.5" />
      <circle cx="17" cy="17.5" r="1.5" />
    </svg>
  )
}
 
function CartIcon() {
  return (
    <svg {...iconBase}>
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8H17a1 1 0 0 0 1-.8L19.5 8H6" />
      <circle cx="9" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
    </svg>
  )
}
 
function ReportIcon() {
  return (
    <svg {...iconBase}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h7M9 17h5" />
    </svg>
  )
}
 
function GearIcon() {
  return (
    <svg {...iconBase}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </svg>
  )
}
 
type NavItem = {
  label: string
  page: AppPath
  icon: (props: IconProps) => ReactNode
  adminOnly?: boolean
}
 
const mainItems: NavItem[] = [
  { label: 'Início', page: 'dashboard' as const, icon: (p) => <HomeIcon {...p} /> },
  { label: 'Vendas', page: 'vendas' as const, icon: (p) => <TagIcon {...p} /> },
  { label: 'Estoque', page: 'estoque' as const, icon: (p) => <BoxIcon {...p} /> },
  { label: 'Financeiro', page: 'financeiro' as const, icon: (p) => <ChartIcon {...p} /> },
]
 
const moreItems: NavItem[] = [
  { label: 'Fornecedores', page: 'fornecedores' as const, icon: () => <TruckIcon /> },
  { label: 'Compras', page: 'compras' as const, icon: () => <CartIcon /> },
  { label: 'Relatórios', page: 'relatorios' as const, icon: () => <ReportIcon /> },
  { label: 'Configurações', page: 'configuracoes' as const, icon: () => <GearIcon />, adminOnly: true },
]
 
const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'
 
function isItemActive(currentPage: string, page: AppPath) {
  if (currentPage === page) return true
  if (page === 'estoque') {
    return currentPage.startsWith('estoque') || currentPage.startsWith('produtos')
  }
  if (page === 'dashboard') return false
  return currentPage.startsWith(page)
}

function AppSidebar({ currentPage, onNavigate, userName}: AppSidebarProps) {
  const { session } = useAuth()
  const isAdministrator =
    session?.usuario.perfil.trim().toUpperCase() === 'ADMINISTRADOR'

 const [moreOpen, setMoreOpen] = useState(false)
 
  const visibleMore = moreItems.filter(
    (item) => !item.adminOnly || isAdministrator,
  )
  const moreActive =
    visibleMore.some((item) => isItemActive(currentPage, item.page)) ||
    currentPage === 'perfil'
  const displayName = userName || 'Marcos Almeida'
 
  useEffect(() => {
    if (!moreOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [moreOpen])
 
  const go = (page: AppPath) => {
    setMoreOpen(false)
    onNavigate(page)
  }

  return (
    <>
      {/* Desktop: menu lateral */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#e3dfd2] bg-[#faf8f2] px-4 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b4a2b] text-sm font-bold text-white"
          >
            A
          </span>
          <span className="text-[15px] font-bold leading-tight">
            Adega Bom Sabor
          </span>
        </div>
 
        <nav
          aria-label="Navegação principal"
          className="mt-8 flex-1 overflow-y-auto"
        >
          <ul className="space-y-1">
            {[...mainItems, ...visibleMore].map((item) => {
              const active = isItemActive(currentPage, item.page)
              return (
                <li key={item.label}>
                  <button
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${focusRing} ${
                      active
                        ? 'bg-[#ebe8dd] font-semibold text-[#26291f]'
                        : 'text-[#6f6b60] hover:bg-[#f1eee4]'
                    }`}
                    onClick={() => go(item.page)}
                    type="button"
                  >
                    {item.icon({ active })}
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
 
        <footer className="mt-4 border-t border-[#e3dfd2] pt-4">
          <button
            aria-current={currentPage === 'perfil' ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[#f1eee4] ${focusRing} ${
              currentPage === 'perfil' ? 'bg-[#ebe8dd]' : ''
            }`}
            onClick={() => go('perfil')}
            type="button"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebe8dd] text-sm font-medium"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {displayName}
              </span>
              <span className="block text-xs text-[#6f6b60]">
                {isAdministrator ? 'Administrador' : 'Colaborador'}
              </span>
            </span>
          </button>
        </footer>
      </aside>
 
      {/* Mobile: painel "Mais" */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-[#26291f]/40"
            onClick={() => setMoreOpen(false)}
            type="button"
          />
          <div
            aria-label="Mais opções"
            className="absolute inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] mx-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#e3dfd2] bg-white p-2 shadow-[0_8px_24px_rgba(38,41,31,0.12)]"
            role="dialog"
          >
            <ul>
              {visibleMore.map((item) => (
                <li key={item.label}>
                  <button
                    aria-current={
                      isItemActive(currentPage, item.page) ? 'page' : undefined
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] text-[#26291f] transition hover:bg-[#faf8f2] ${focusRing}`}
                    onClick={() => go(item.page)}
                    type="button"
                  >
                    <span className="text-[#6f6b60]">{item.icon({})}</span>
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="mt-1 border-t border-[#eee9dc] pt-1">
                <button
                  aria-current={currentPage === 'perfil' ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#faf8f2] ${focusRing}`}
                  onClick={() => go('perfil')}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#ebe8dd] text-[11px] font-medium"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] text-[#26291f]">
                      {displayName}
                    </span>
                    <span className="block text-xs text-[#6f6b60]">
                      {isAdministrator ? 'Administrador' : 'Colaborador'}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
 
      {/* Mobile: barra inferior */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e3dfd2] bg-[#faf8f2]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {mainItems.map((item) => {
            const active = isItemActive(currentPage, item.page)
            return (
              <li className="flex-1" key={item.label}>
                <button
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full flex-col items-center gap-1 pb-2.5 pt-3 text-[11px] transition ${focusRing} ${
                    active
                      ? 'font-bold text-[#26291f]'
                      : 'font-medium text-[#6f6b60]'
                  }`}
                  onClick={() => go(item.page)}
                  type="button"
                >
                  {item.icon({ active })}
                  {item.label}
                </button>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              aria-expanded={moreOpen}
              className={`flex w-full flex-col items-center gap-1 pb-2.5 pt-3 text-[11px] transition ${focusRing} ${
                moreOpen || moreActive
                  ? 'font-bold text-[#26291f]'
                  : 'font-medium text-[#6f6b60]'
              }`}
              onClick={() => setMoreOpen((open) => !open)}
              type="button"
            >
              <MenuIcon />
              Mais
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
 
export default AppSidebar
