export function downloadReportCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((field) => `"${field.replaceAll('"', '""')}"`).join(';'),
    )
    .join('\n')
  const file = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
