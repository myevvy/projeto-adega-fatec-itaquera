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
    <main>
      <BrandPanel description={description} businessName={businessName} />
      <section>{children}</section>
    </main>
  )
}

export default AuthLayout
