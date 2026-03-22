import { api } from '@/config/api'
import type { StatsDashboardQuery, StatsResponse } from './types'

export const StatsAPI = {
	async getDashboard(query: StatsDashboardQuery = {}): Promise<StatsResponse> {
		const params: StatsDashboardQuery = {}

		if (query.clientId) {
			params.clientId = query.clientId
		}

		if (query.months) {
			params.months = query.months
		}

		const res = await api.get('/stats', {
			params: Object.keys(params).length ? params : undefined,
		})

		return res.data
	},
}
