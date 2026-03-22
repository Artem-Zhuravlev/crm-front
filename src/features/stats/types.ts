import type { AppointmentStatus } from '@/features/appointments/status'

export type StatsScope = {
  clientId: string | null
  clientName: string | null
  mode: 'global' | 'client'
}

export type StatsOverview = {
  totalClients: number
  activeClients: number
  totalAppointments: number
  totalPayments: number
  totalRevenue: number
  averageCheck: number
  completedAppointments: number
  completionRate: number
  noShowRate: number
  unreachableRate: number
  cancelledAppointments: number
}

export type AppointmentStatusStat = {
  status: AppointmentStatus
  count: number
}

export type PaymentMethodStat = {
  method: string
  paymentsCount: number
  totalAmount: number
}

export type TopClientStat = {
  clientId: string
  clientName: string
  appointmentsCount: number
  completedAppointments: number
  paymentsCount: number
  totalRevenue: number
  averageCheck: number
  lastActivityAt: string | null
}

export type MonthlyStat = {
  month: string
  revenue: number
  paymentsCount: number
  appointmentsCount: number
  completedAppointments: number
}

export type ClientStatsSnapshot = {
  clientId: string
  clientName: string
  totalRevenue: number
  averageCheck: number
  paymentsCount: number
  appointmentsCount: number
  completedAppointments: number
  lastPaymentAt: string | null
  lastAppointmentAt: string | null
  appointmentStatuses: AppointmentStatusStat[]
  paymentMethods: PaymentMethodStat[]
}

export type StatsResponse = {
  generatedAt: string
  scope: StatsScope
  overview: StatsOverview
  appointmentStatuses: AppointmentStatusStat[]
  paymentMethods: PaymentMethodStat[]
  topClients: TopClientStat[]
  monthlyStats: MonthlyStat[]
  selectedClient: ClientStatsSnapshot | null
}

export type StatsDashboardQuery = {
  clientId?: string
  months?: number
}
