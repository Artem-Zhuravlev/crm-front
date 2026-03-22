<template>
  <section class="history-page">
    <div class="history-hero">
      <div>
        <p class="history-kicker">{{ t('history.eyebrow') }}</p>
        <h1>{{ t('history.title') }}</h1>
        <p class="history-subtitle">
          {{ t('history.subtitle') }}
        </p>
      </div>
    </div>

    <div class="history-filters">
      <v-select
        v-model="filters.clientId"
        :items="clientOptions"
        item-title="title"
        item-value="value"
        :label="t('common.client')"
        density="compact"
        variant="outlined"
        clearable
        hide-details
      />

      <v-select
        v-model="filters.type"
        :items="typeOptions"
        item-title="title"
        item-value="value"
        :label="t('history.type')"
        density="compact"
        variant="outlined"
        clearable
        hide-details
      />

      <v-text-field
        v-model="filters.search"
        :label="t('common.search')"
        density="compact"
        variant="outlined"
        clearable
        hide-details
      />

      <v-text-field
        v-model="filters.dateFrom"
        type="date"
        :label="t('common.from')"
        density="compact"
        variant="outlined"
        clearable
        hide-details
      />

      <v-text-field
        v-model="filters.dateTo"
        type="date"
        :label="t('common.to')"
        density="compact"
        variant="outlined"
        clearable
        hide-details
      />

      <v-select
        v-model="filters.limit"
        :items="limitOptions"
        :label="t('common.limit')"
        density="compact"
        variant="outlined"
        hide-details
      />

      <v-btn variant="text" color="primary" @click="resetFilters">{{ t('common.reset') }}</v-btn>
    </div>

    <div v-if="errorMessage" class="error-banner">
      <span>{{ errorMessage }}</span>
      <v-btn size="small" variant="text" color="error" @click="fetchHistory">{{ t('common.retry') }}</v-btn>
    </div>

    <div class="history-summary">
      <article class="summary-card">
        <span>{{ t('history.summaryTotal') }}</span>
        <strong>{{ history?.summary.total ?? 0 }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ t('history.summaryAppointments') }}</span>
        <strong>{{ history?.summary.appointments ?? 0 }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ t('history.summaryPayments') }}</span>
        <strong>{{ history?.summary.payments ?? 0 }}</strong>
      </article>
      <article class="summary-card">
        <span>{{ t('history.summaryRevenue') }}</span>
        <strong>{{ formatCurrency(history?.summary.totalRevenue ?? 0) }}</strong>
      </article>
    </div>

    <div v-if="isLoading" class="history-loading">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="history?.items.length" class="history-timeline">
      <article v-for="item in history.items" :key="`${item.type}-${item.id}`" class="timeline-card">
        <div class="timeline-card__dot" :class="`timeline-card__dot--${item.type}`"></div>

        <div class="timeline-card__content">
          <div class="timeline-card__header">
            <div>
              <div class="timeline-card__title-row">
                <h3>{{ item.title }}</h3>
                <v-chip size="x-small" :color="item.type === 'payment' ? 'teal' : 'primary'" variant="tonal">
                  {{ item.type === 'payment' ? t('common.payment') : t('common.appointment') }}
                </v-chip>
                <v-chip
                  v-if="item.appointmentStatus"
                  size="x-small"
                  :color="appointmentStatusColorMap[item.appointmentStatus]"
                  variant="tonal"
                >
                  {{ getAppointmentStatusLabel(t, item.appointmentStatus) }}
                </v-chip>
              </div>
              <p class="timeline-card__meta">
                {{ item.clientName }} · {{ formatDateTime(item.occurredAt) }}
              </p>
            </div>

            <strong v-if="item.paymentAmount" class="timeline-card__amount">
              {{ formatCurrency(item.paymentAmount) }}
            </strong>
          </div>

          <p v-if="item.description" class="timeline-card__description">{{ item.description }}</p>

          <div class="timeline-card__footer">
            <span>ID {{ item.clientId.slice(0, 8) }}</span>
            <span v-if="item.paymentMethod">{{ t('history.paymentMethod', { value: item.paymentMethod }) }}</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <h3>{{ t('history.nothingFound') }}</h3>
      <p>{{ t('history.nothingFoundHint') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { appointmentStatusColorMap, getAppointmentStatusLabel } from '@/features/appointments/status'
import { ClientsAPI } from '@/features/clients/service'
import type { Client } from '@/features/clients/types'
import { intlLocaleMap, type AppLocale } from '@/i18n'
import { HistoryAPI } from '../service'
import type { HistoryEventType, HistoryResponse } from '../types'

const { t, locale } = useI18n()

const isLoading = ref(false)
const errorMessage = ref('')
const history = ref<HistoryResponse | null>(null)
const clients = ref<Client[]>([])

const filters = reactive({
  clientId: null as string | null,
  type: null as HistoryEventType | null,
  search: '',
  dateFrom: '',
  dateTo: '',
  limit: 100,
})

const clientOptions = ref<Array<{ title: string; value: string }>>([])

const typeOptions = computed<Array<{ title: string; value: HistoryEventType }>>(() => [
  { title: t('common.appointment'), value: 'appointment' },
  { title: t('common.payment'), value: 'payment' },
])

const limitOptions = [50, 100, 200, 300]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat(intlLocaleMap[locale.value as AppLocale], {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDateTime = (value: string) => dayjs(value).format('DD.MM.YYYY HH:mm')

const fetchClients = async () => {
  clients.value = await ClientsAPI.getAll()
  clientOptions.value = clients.value
    .filter((client) => Boolean(client.id))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((client) => ({ title: client.name, value: client.id as string }))
}

const fetchHistory = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    history.value = await HistoryAPI.getAll({
      clientId: filters.clientId ?? undefined,
      type: filters.type ?? undefined,
      search: filters.search || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      limit: filters.limit,
    })
  } catch (error) {
    console.error('Failed to fetch history', error)
    errorMessage.value = t('history.loadError')
  } finally {
    isLoading.value = false
  }
}

const resetFilters = () => {
  filters.clientId = null
  filters.type = null
  filters.search = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.limit = 100
}

watch(
  () => [filters.clientId, filters.type, filters.search, filters.dateFrom, filters.dateTo, filters.limit],
  () => {
    void fetchHistory()
  },
)

onMounted(async () => {
  await Promise.all([fetchClients(), fetchHistory()])
})
</script>

<style scoped>
.history-page {
  display: grid;
  gap: 14px;
}

.history-hero,
.history-filters,
.summary-card,
.timeline-card,
.empty-state {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
}

.history-hero,
.history-filters,
.timeline-card,
.empty-state {
  padding: 14px;
}

.history-kicker {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.history-hero h1,
.empty-state h3,
.timeline-card h3 {
  margin: 0;
  color: #0f172a;
}

.history-subtitle,
.empty-state p,
.timeline-card__description,
.timeline-card__meta,
.timeline-card__footer {
  color: #64748b;
}

.history-filters {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, minmax(120px, 1fr)) auto;
  align-items: center;
}

.history-summary {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 16px;
}

.summary-card span {
  color: #64748b;
}

.summary-card strong {
  font-size: 18px;
  line-height: 1.1;
  color: #0f172a;
}

.history-timeline {
  display: grid;
  gap: 10px;
}

.timeline-card {
  display: grid;
  grid-template-columns: 12px 1fr;
  gap: 10px;
  align-items: start;
  border-radius: 16px;
}

.timeline-card__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  margin-top: 6px;
}

.timeline-card__dot--appointment {
  background: #2563eb;
}

.timeline-card__dot--payment {
  background: #0f766e;
}

.timeline-card__content {
  display: grid;
  gap: 6px;
}

.timeline-card__header,
.timeline-card__footer,
.timeline-card__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.timeline-card__title-row {
  justify-content: flex-start;
}

.timeline-card__meta {
  margin: 2px 0 0;
  font-size: 13px;
}

.timeline-card__amount {
  color: #0f172a;
  font-size: 16px;
}

.timeline-card h3 {
  font-size: 20px;
  line-height: 1.1;
}

.timeline-card__description,
.timeline-card__footer {
  font-size: 13px;
}

.history-loading,
.empty-state {
  min-height: 200px;
  display: grid;
  place-items: center;
  text-align: center;
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}

@media (max-width: 1280px) {
  .history-filters {
    grid-template-columns: repeat(3, minmax(150px, 1fr));
  }

  .history-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .history-filters,
  .history-summary,
  .timeline-card {
    grid-template-columns: 1fr;
  }
}
</style>
