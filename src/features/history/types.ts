import type { AppointmentStatus } from '@/features/appointments/status'

export type HistoryEventType = 'appointment' | 'payment'

export type HistoryItem = {
  id: string
  type: HistoryEventType
  occurredAt: string
  clientId: string
  clientName: string
  title: string
  description: string | null
  appointmentStatus?: AppointmentStatus
  paymentAmount?: number
  paymentMethod?: string | null
}

export type HistorySummary = {
  total: number
  appointments: number
  payments: number
  totalRevenue: number
}

export type HistoryResponse = {
  generatedAt: string
  filters: {
    clientId: string | null
    type: HistoryEventType | null
    search: string | null
    dateFrom: string | null
    dateTo: string | null
    limit: number
  }
  summary: HistorySummary
  items: HistoryItem[]
}

export type HistoryQuery = {
  clientId?: string
  type?: HistoryEventType
  search?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}
