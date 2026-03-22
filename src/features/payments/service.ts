import type { Payment, PaymentPayload } from './types'
import { api } from '@/config/api'

export const PaymentsAPI = {
	async getAll(): Promise<Payment[]> {
		const res = await api.get('/payments')
		return res.data
	},

	async getById(id: string): Promise<Payment> {
		const res = await api.get(`/payments/${id}`)
		return res.data
	},

	async create(payload: PaymentPayload): Promise<Payment> {
		const res = await api.post('/payments', payload)
		return res.data
	},

	async update(id: string, payload: PaymentPayload): Promise<Payment> {
		const res = await api.patch(`/payments/${id}`, payload)
		return res.data
	},

	async remove(id: string): Promise<void> {
		await api.delete(`/payments/${id}`)
	},
}
