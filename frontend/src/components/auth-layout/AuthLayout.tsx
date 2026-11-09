import type { ReactNode } from 'react'
import BrandPanel from '../brand-panel/BrandPanel'

type AuthLayoutProps = {
  children: ReactNode
  description: string
  businessName?: string
}

function AuthLayout({
  children,
  description,
  businessName,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#faf9f6] md:grid md:grid-cols-2">
      <BrandPanel description={description} businessName={businessName} />
      <section className="mx-auto w-full max-w-md px-6 pb-10 md:flex md:flex-col md:justify-center">{children}</section>
    </main>
  )
}

export default AuthLayout
