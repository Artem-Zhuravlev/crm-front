import type {
  Appointment,
  AppointmentFiltersQuery,
  AppointmentPayload,
  AppointmentUpdatePayload,
} from './types'
import { api } from '@/config/api'

export const AppointmentsAPI = {
  async getAll(params?: AppointmentFiltersQuery): Promise<Appointment[]> {
    const res = await api.get('/appointments', { params })
    return res.data
  },

  async getById(id: string): Promise<Appointment> {
    const res = await api.get(`/appointments/${id}`)
    return res.data
  },

  async create(payload: AppointmentPayload): Promise<Appointment> {
    const res = await api.post('/appointments', payload)
    return res.data
  },

  async update(id: string, payload: AppointmentUpdatePayload): Promise<Appointment> {
    const res = await api.patch(`/appointments/${id}`, payload)
    return res.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`)
  },
}
