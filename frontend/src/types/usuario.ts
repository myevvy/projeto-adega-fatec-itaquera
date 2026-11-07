export type SetupData = {
  businessName: string
  category: string
  phone: string
  adminName: string
  email: string
}

export type WorkspaceUser = {
  id: string
  name: string
  email: string
  role: 'Administrador' | 'Operador'
  active: boolean
}

export type NotificationPreferences = {
  lowStock: boolean
  emptyStock: boolean
  salesSummary: boolean
  email: boolean
  push: boolean
}
