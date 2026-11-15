export type SetupData = {
  businessName: string
  category: string
  phone: string
  adminName: string
  email: string
}

export type NotificationPreferences = {
  lowStock: boolean
  emptyStock: boolean
  salesSummary: boolean
  email: boolean
  push: boolean
}
