type BrandPanelProps = {
  description: string
  businessName?: string
}

function BrandPanel({
  description,
  businessName = 'Adega Bom Sabor',
}: BrandPanelProps) {
  return (
    <header>
      <p aria-hidden="true">●</p>
      <h1>{businessName}</h1>
      <p>{description}</p>
    </header>
  )
}

export default BrandPanel
