import { api } from '@/config/api'
import type { HistoryQuery, HistoryResponse } from './types'

export const HistoryAPI = {
  async getAll(query: HistoryQuery = {}): Promise<HistoryResponse> {
    const params: HistoryQuery = {}

    if (query.clientId) {
      params.clientId = query.clientId
    }

    if (query.type) {
      params.type = query.type
    }

    if (query.search?.trim()) {
      params.search = query.search.trim()
    }

    if (query.dateFrom) {
      params.dateFrom = query.dateFrom
    }

    if (query.dateTo) {
      params.dateTo = query.dateTo
    }

    if (query.limit) {
      params.limit = query.limit
    }

    const res = await api.get('/history', {
      params: Object.keys(params).length ? params : undefined,
    })

    return res.data
  },
}
