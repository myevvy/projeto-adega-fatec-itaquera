import type { SalesPeriod } from '../../types'

type FinancePeriodFilterProps = {
  onChange: (period: SalesPeriod) => void
  value: SalesPeriod
}

const periods: { label: string; value: SalesPeriod }[] = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '3 meses', value: '90' },
  { label: '6 meses', value: '180' },
  { label: '12 meses', value: '365' },
]

function FinancePeriodFilter({ onChange, value }: FinancePeriodFilterProps) {
  return (
    <fieldset>
      <legend>Período</legend>
      {periods.map((period) => (
        <button
          aria-pressed={value === period.value}
          key={period.value}
          onClick={() => onChange(period.value)}
          type="button"
        >
          {period.label}
        </button>
      ))}
    </fieldset>
  )
}

export default FinancePeriodFilter
