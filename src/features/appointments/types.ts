import type { Client } from '@/features/clients/types'
import type { AppointmentStatus } from './status'

export type Appointment = {
  id: string
  title: string
  description?: string
  date: string
  status: AppointmentStatus
  client: Client
}

export type AppointmentDraftPayload = {
  clientId: string
  date: string
  title?: string
  description?: string
  status?: AppointmentStatus
}

export type AppointmentFormValues = {
  id?: string
  clientId: string
  title: string
  description: string
  date: string
  time: string
  status: AppointmentStatus
}

export type AppointmentPayload = AppointmentDraftPayload

export type AppointmentUpdatePayload = Partial<AppointmentDraftPayload>

export type AppointmentFiltersQuery = {
  search?: string
  clientId?: string
  status?: AppointmentStatus
  year?: number
  month?: number
  week?: number
  date?: string
}

export type CalendarDropPayload = {
  clientId: string
  date: string
}

export type CalendarMovePayload = {
  appointmentId: string
  date: string
}
