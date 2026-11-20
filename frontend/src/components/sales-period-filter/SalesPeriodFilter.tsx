import { useId } from 'react'
import type { SalesPeriod } from '../../types'

type SalesPeriodFilterProps = {
  onChange: (period: SalesPeriod) => void
  value: SalesPeriod
}

const OPTIONS: { value: SalesPeriod; label: string; longLabel: string }[] = [
  { value: 'today', label: 'Hoje', longLabel: 'Hoje' },
  { value: '7', label: '7 dias', longLabel: 'Últimos 7 dias' },
  { value: '30', label: '30 dias', longLabel: 'Últimos 30 dias' },
  { value: '90', label: '3 meses', longLabel: 'Últimos 3 meses' },
  { value: '180', label: '6 meses', longLabel: 'Últimos 6 meses' },
  { value: '365', label: '12 meses', longLabel: 'Últimos 12 meses' },
  { value: 'all', label: 'Todo o período', longLabel: 'Todo o período' },
]

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4a2b]/40'

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f6b60]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="2.5" width="18" x="3" y="5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8a496]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SalesPeriodFilter({ onChange, value }: SalesPeriodFilterProps) {
  const groupName = useId()
  const selectId = useId()

  return (
    <>
      <div className="relative xl:hidden">
        <label className="sr-only" htmlFor={selectId}>
          Período
        </label>
        <CalendarIcon />
        <select
          className={`h-10 w-full min-w-0 max-w-44 cursor-pointer appearance-none rounded-xl border border-[#e3dfd2] bg-white pl-10 pr-9 text-sm font-medium text-[#26291f] transition hover:bg-[#fdfcf8] sm:w-48 sm:max-w-none ${focusRing}`}
          id={selectId}
          onChange={(event) => onChange(event.target.value as SalesPeriod)}
          value={value}
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.longLabel}
            </option>
          ))}
        </select>
        <ChevronDownIcon />
      </div>
      
      <fieldset className="hidden min-w-0 xl:block">
        <legend className="sr-only">Período</legend>
        <div className="flex items-center gap-1 rounded-2xl border border-[#e3dfd2] bg-white p-1">
          {OPTIONS.map((option) => (
            <label className="cursor-pointer" key={option.value}>
              <input
                checked={value === option.value}
                className="peer sr-only"
                name={groupName}
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              <span className="block whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium text-[#4b4d42] transition hover:bg-[#ebe8dd] peer-checked:bg-[#3b4a2b] peer-checked:text-white peer-checked:hover:bg-[#3b4a2b] peer-focus-visible:ring-2 peer-focus-visible:ring-[#3b4a2b]/40">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  )
}

export default SalesPeriodFilter
