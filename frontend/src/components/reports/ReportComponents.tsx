import { useState } from 'react'
import type { ReactNode } from 'react'
import AppSidebar from '../app-sidebar/AppSidebar'
import type { AppPath, SetupData } from '../../types'
import type { ReportPeriod } from '../../types/relatorios'

const chartColors = ['#4b6337', '#8ca173', '#c4a36a', '#b66d50', '#64748b']

type ReportFrameProps = {
  children: ReactNode
  currentPage: string
  onNavigate: (path: AppPath) => void
  setupData: SetupData
  title: string
  backPath?: AppPath
}

export function ReportFrame({
  children,
  currentPage,
  onNavigate,
  setupData,
  title,
  backPath,
}: ReportFrameProps) {
  return (
    <main className="min-h-screen bg-[#f7f6f1] lg:flex">
      <AppSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        userName={setupData.adminName}
      />
      <section className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-7 lg:px-10 lg:pb-10 lg:pt-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {backPath && (
            <button
              className="rounded-full border border-[#e4e3dc] bg-white px-4 py-2 text-sm font-medium text-[#3b4a2b] shadow-sm transition hover:bg-[#f1f3eb]"
              onClick={() => onNavigate(backPath)}
              type="button"
            >
              ← Voltar
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-[#252a20] sm:text-3xl">
            {title}
          </h1>
        </div>
        {children}
      </section>
    </main>
  )
}

type ReportDateRangeProps = {
  initialPeriod: ReportPeriod
  onApply: (period: ReportPeriod) => void
  loading?: boolean
}

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return localDate(date)
}

export function ReportDateRange({
  initialPeriod,
  onApply,
  loading = false,
}: ReportDateRangeProps) {
  const [start, setStart] = useState(initialPeriod.inicio)
  const [end, setEnd] = useState(initialPeriod.fim)
  const invalid = !start || !end || start > end

  const setPreset = (days: number) => {
    setStart(daysAgo(days - 1))
    setEnd(localDate(new Date()))
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-[#e7e5dc] bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault()
        if (!invalid) onApply({ inicio: start, fim: end })
      }}
    >
      <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-[#68705e]">
        Data inicial
        <input
          className="rounded-xl border border-[#e1e3d9] bg-[#fbfbf8] px-3 py-2.5 text-sm text-[#252a20] outline-none focus:border-[#71815d] focus:ring-2 focus:ring-[#71815d]/15"
          max={end || undefined}
          onChange={(event) => setStart(event.target.value)}
          required
          type="date"
          value={start}
        />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-[#68705e]">
        Data final
        <input
          className="rounded-xl border border-[#e1e3d9] bg-[#fbfbf8] px-3 py-2.5 text-sm text-[#252a20] outline-none focus:border-[#71815d] focus:ring-2 focus:ring-[#71815d]/15"
          min={start || undefined}
          onChange={(event) => setEnd(event.target.value)}
          required
          type="date"
          value={end}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-xl border border-[#e1e3d9] px-3 py-2.5 text-xs font-semibold text-[#566149] transition hover:bg-[#f5f6f1]"
          onClick={() => setPreset(7)}
          type="button"
        >
          7 dias
        </button>
        <button
          className="rounded-xl border border-[#e1e3d9] px-3 py-2.5 text-xs font-semibold text-[#566149] transition hover:bg-[#f5f6f1]"
          onClick={() => setPreset(30)}
          type="button"
        >
          30 dias
        </button>
        <button
          className="rounded-xl bg-[#3b4a2b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#2f3c22] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={invalid || loading}
          type="submit"
        >
          {loading ? 'Carregando…' : 'Aplicar período'}
        </button>
      </div>
      {invalid && (
        <p className="text-xs text-red-700 sm:basis-full" role="alert">
          A data inicial deve ser anterior ou igual à data final.
        </p>
      )}
    </form>
  )
}

export function ReportMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <article className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#747a6d]">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#252a20]">
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-[#858a80]">{detail}</p>}
    </article>
  )
}

export function ReportCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[#e7e5dc] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-[#30372b]">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-[#858a80]">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

export function ReportNotice({
  loading,
  error,
  onRetry,
}: {
  loading: boolean
  error: string
  onRetry: () => void
}) {
  if (loading) {
    return (
      <p
        aria-live="polite"
        className="rounded-2xl border border-[#e7e5dc] bg-white p-8 text-center text-sm text-[#68705e]"
      >
        Carregando dados do relatório…
      </p>
    )
  }
  if (!error) return null

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <span>{error}</span>
      <button
        className="rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold hover:bg-red-100"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  )
}

export function EmptyChart({ message = 'Sem dados para este período.' }: { message?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl bg-[#fafaf7] px-4 text-center text-sm text-[#858a80]">
      {message}
    </div>
  )
}

export function LineChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number }[]
  formatValue: (value: number) => string
}) {
  if (data.length === 0) return <EmptyChart />

  const width = 640
  const height = 240
  const left = 58
  const right = 18
  const top = 18
  const bottom = 38
  const maxValue = Math.max(...data.map((point) => point.value), 1)
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const points = data.map((point, index) => ({
    ...point,
    x:
      data.length === 1
        ? left + chartWidth / 2
        : left + (index / (data.length - 1)) * chartWidth,
    y: top + chartHeight - (point.value / maxValue) * chartHeight,
  }))
  const labelIndexes = new Set([
    0,
    Math.floor((data.length - 1) / 2),
    data.length - 1,
  ])

  return (
    <div className="w-full overflow-hidden">
      <svg
        aria-label="Gráfico de linha do faturamento diário"
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        {[0, 1, 2, 3].map((line) => {
          const y = top + (chartHeight / 3) * line
          return (
            <g key={line}>
              <line
                stroke="#e9ebe4"
                strokeDasharray="4 5"
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
              />
              <text
                fill="#858a80"
                fontSize="10"
                textAnchor="end"
                x={left - 8}
                y={y + 3}
              >
                {formatValue(maxValue * (1 - line / 3))}
              </text>
            </g>
          )
        })}
        <polyline
          fill="none"
          points={points.map((point) => `${point.x},${point.y}`).join(' ')}
          stroke={chartColors[0]}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              fill="white"
              r="4"
              stroke={chartColors[0]}
              strokeWidth="2"
            >
              <title>{`${point.label}: ${formatValue(point.value)}`}</title>
            </circle>
            {labelIndexes.has(index) && (
              <text
                fill="#747a6d"
                fontSize="10"
                textAnchor="middle"
                x={point.x}
                y={height - 12}
              >
                {point.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

export function HorizontalBars({
  data,
  formatValue,
}: {
  data: { label: string; value: number }[]
  formatValue: (value: number) => string
}) {
  if (data.length === 0) return <EmptyChart />
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
            <span className="truncate font-medium text-[#4b5145]">
              {item.label}
            </span>
            <span className="shrink-0 font-semibold text-[#39452d]">
              {formatValue(item.value)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#eef0e9]">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: chartColors[index % chartColors.length],
                width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 2 : 0)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DonutChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number }[]
  formatValue: (value: number) => string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const circumference = 2 * Math.PI * 44
  let offset = 0

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[150px_1fr]">
      <svg
        aria-label="Gráfico de rosca"
        className="mx-auto w-36"
        role="img"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          fill="none"
          r="44"
          stroke="#eef0e9"
          strokeWidth="16"
        />
        {total > 0 &&
          data.map((item, index) => {
            const length = (item.value / total) * circumference
            const segment = (
              <circle
                cx="60"
                cy="60"
                fill="none"
                key={`${item.label}-${index}`}
                r="44"
                stroke={chartColors[index % chartColors.length]}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeWidth="16"
                transform="rotate(-90 60 60)"
              >
                <title>{`${item.label}: ${formatValue(item.value)}`}</title>
              </circle>
            )
            offset += length
            return segment
          })}
        <text
          fill="#30372b"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          x="60"
          y="64"
        >
          {formatValue(total)}
        </text>
      </svg>
      {data.length === 0 ? (
        <p className="text-sm text-[#858a80]">Sem dados para este período.</p>
      ) : (
        <ul className="space-y-2.5">
          {data.map((item, index) => (
            <li
              className="flex items-center justify-between gap-3 text-xs"
              key={`${item.label}-${index}`}
            >
              <span className="flex min-w-0 items-center gap-2 text-[#62695c]">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <strong className="shrink-0 text-[#30372b]">
                {formatValue(item.value)}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ExportButton({
  onClick,
  disabled = false,
}: {
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      className="rounded-xl bg-[#3b4a2b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f3c22] disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      Exportar relatório
    </button>
  )
}
