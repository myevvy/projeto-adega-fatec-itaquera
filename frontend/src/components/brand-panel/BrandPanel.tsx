type BrandPanelProps = {
  description: string
  businessName?: string
}

function BrandPanel({description, businessName = 'Adega Bom Sabor', }: BrandPanelProps) {
  return (
    <div className="flex flex-col items-center px-6 pb-10 pt-16 text-center md:justify-center md:pb-0 md:pt-0">
      <div className="h-[60px] w-[60px] rounded-full bg-[#1c1f1a]" />
      <h1 className="mt-6 text-lg font-bold text-[#1c1f1a]">
        {businessName || 'Adega Bom Sabor'}
      </h1>
       <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  )
}

export default BrandPanel
