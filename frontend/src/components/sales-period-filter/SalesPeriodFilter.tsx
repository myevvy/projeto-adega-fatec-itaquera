import type { SalesPeriod } from '../../types'

type SalesPeriodFilterProps = {
  onChange: (period: SalesPeriod) => void
  value: SalesPeriod
}

function SalesPeriodFilter({ onChange, value }: SalesPeriodFilterProps) {
  return (
    <label>
      Período
      <select
        onChange={(event) => onChange(event.target.value as SalesPeriod)}
        value={value}
      >
        <option value="today">Hoje</option>
        <option value="7">Últimos 7 dias</option>
        <option value="30">Últimos 30 dias</option>
        <option value="90">Últimos 90 dias</option>
        <option value="180">Últimos 180 dias</option>
        <option value="365">Últimos 365 dias</option>
        <option value="all">Todo o período</option>
      </select>
    </label>
  )
}

export default SalesPeriodFilter
