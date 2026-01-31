import type { Client } from './types'
import { api } from '@/config/api'

export const ClientsAPI = {
  async getAll(): Promise<Client[]> {
    const res = await api.get('/clients')
    return res.data
  },

  async create(client: Partial<Client>): Promise<Client> {
    const res = await api.post('/clients', client)
    return res.data
  },

  async update(id: number, client: Partial<Client>): Promise<Client> {
    const res = await api.put(`/clients/${id}`, client)
    return res.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/clients/${id}`)
  },
}
