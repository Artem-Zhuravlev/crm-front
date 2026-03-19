import type { Client } from '@/features/clients/types'

export type Appointment = {
  id: string
  title: string
  description?: string
  date: string
  completed: boolean
  client: Client
}

export type AppointmentFormValues = {
  id?: string
  clientId: string
  title: string
  description: string
  date: string
  time: string
  completed: boolean
}

export type AppointmentPayload = {
  clientId: string
  title: string
  description?: string
  date: string
  completed?: boolean
}
