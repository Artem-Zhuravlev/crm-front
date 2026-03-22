<template>
  <section class="stats-page">
    <div class="stats-hero">
      <div>
        <p class="stats-kicker">{{ t('stats.analytics') }}</p>
        <h1>{{ t('stats.title') }}</h1>
        <p class="stats-subtitle">
          {{ t('stats.subtitle') }}
        </p>
      </div>

      <div class="stats-toolbar">
        <div class="period-switcher">
          <v-btn
            v-for="option in periodOptions"
            :key="option"
            :color="selectedMonths === option ? 'primary' : undefined"
            :variant="selectedMonths === option ? 'flat' : 'outlined'"
            size="small"
            @click="selectedMonths = option"
          >
            {{ t('stats.labels.months', { count: option }) }}
          </v-btn>
        </div>
        <v-select
          v-model="selectedClientId"
          :items="clientOptions"
          item-title="title"
          item-value="value"
          :label="t('common.client')"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
        />
        <v-btn color="primary" variant="text" @click="selectedClientId = null">
          {{ t('common.allBase') }}
        </v-btn>
      </div>
    </div>

    <div v-if="errorMessage" class="error-banner">
      <span>{{ errorMessage }}</span>
      <v-btn size="small" variant="text" color="error" @click="fetchDashboard">
        {{ t('common.retry') }}
      </v-btn>
    </div>

    <div v-if="isLoading" class="stats-loading">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="dashboard">
      <div class="scope-banner">
        <div>
          <p class="stats-kicker">{{ t('stats.scope') }}</p>
          <h2>
            {{ dashboard.scope.mode === 'client' ? dashboard.scope.clientName : t('stats.allClientsBase') }}
          </h2>
        </div>
        <div class="scope-meta">
          <v-chip color="primary" variant="tonal">
            {{ dashboard.scope.mode === 'client' ? t('stats.clientFocus') : t('stats.globalOverview') }}
          </v-chip>
          <span>{{ t('common.updated') }} {{ formatDateTime(dashboard.generatedAt) }}</span>
        </div>
      </div>

      <div class="stats-grid">
        <article v-for="card in overviewCards" :key="card.title" class="metric-card">
          <span class="metric-card__title">{{ card.title }}</span>
          <strong class="metric-card__value">{{ card.value }}</strong>
          <span class="metric-card__hint">{{ card.hint }}</span>
        </article>
      </div>

      <div class="insights-grid">
        <article v-for="insight in insightCards" :key="insight.title" class="insight-card">
          <span class="insight-card__eyebrow">{{ insight.title }}</span>
          <strong class="insight-card__value">{{ insight.value }}</strong>
          <span class="insight-card__hint">{{ insight.hint }}</span>
        </article>
      </div>

      <div class="stats-layout">
        <section class="panel">
          <div class="panel__header">
            <div>
              <p class="stats-kicker">{{ t('stats.sections.appointments') }}</p>
              <h3>{{ t('stats.sections.appointmentStatuses') }}</h3>
            </div>
          </div>

          <div class="stack-list">
            <div v-for="item in appointmentStatusRows" :key="item.status" class="stack-row">
              <div class="stack-row__meta">
                <span>{{ item.label }}</span>
                <strong>{{ item.count }}</strong>
              </div>
              <v-progress-linear
                :model-value="item.percent"
                :color="item.color"
                height="10"
                rounded
              />
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel__header">
            <div>
              <p class="stats-kicker">{{ t('stats.sections.payments') }}</p>
              <h3>{{ t('stats.sections.paymentMethods') }}</h3>
            </div>
          </div>

          <div v-if="dashboard.paymentMethods.length" class="stack-list">
            <div v-for="method in dashboard.paymentMethods" :key="method.method" class="method-row">
              <div>
                <strong>{{ method.method }}</strong>
                <span>{{ t('stats.labels.paymentsCount', { count: method.paymentsCount }) }}</span>
              </div>
              <strong>{{ formatCurrency(method.totalAmount) }}</strong>
            </div>
          </div>
          <div v-else class="empty-state">{{ t('stats.labels.noPaymentsInScope') }}</div>
        </section>
      </div>

      <section class="panel">
        <div class="panel__header">
          <div>
            <p class="stats-kicker">{{ t('stats.sections.trend') }}</p>
            <h3>{{ t('stats.sections.revenueByMonth') }}</h3>
          </div>
        </div>

        <div v-if="dashboard.monthlyStats.length" class="chart-panel">
          <svg class="revenue-chart" viewBox="0 0 680 240" preserveAspectRatio="none" aria-hidden="true">
            <path :d="revenueAreaPath" class="revenue-chart__area" />
            <path :d="revenueLinePath" class="revenue-chart__line" />
            <g v-for="point in revenuePoints" :key="point.month">
              <circle :cx="point.x" :cy="point.y" r="5" class="revenue-chart__point" />
            </g>
          </svg>

          <div class="chart-labels">
            <div v-for="point in revenuePoints" :key="point.month" class="chart-label">
              <span>{{ formatMonthShort(point.month) }}</span>
              <strong>{{ formatCurrency(point.revenue) }}</strong>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">{{ t('stats.labels.noRevenueChart') }}</div>
      </section>

      <section class="panel">
        <div class="panel__header">
          <div>
            <p class="stats-kicker">{{ t('stats.sections.volume') }}</p>
            <h3>{{ t('stats.sections.activityByMonth') }}</h3>
          </div>
        </div>

        <div v-if="activityBars.length" class="activity-chart">
          <div v-for="item in activityBars" :key="item.month" class="activity-group">
            <div class="activity-columns">
              <div class="activity-bar-shell">
                <div class="activity-bar activity-bar--appointments" :style="{ height: `${item.appointmentsHeight}%` }" />
              </div>
              <div class="activity-bar-shell">
                <div class="activity-bar activity-bar--payments" :style="{ height: `${item.paymentsHeight}%` }" />
              </div>
            </div>
            <div class="activity-meta">
              <strong>{{ formatMonthShort(item.month) }}</strong>
              <span>{{ t('stats.labels.appointmentsCount', { count: item.appointmentsCount }) }}</span>
              <span>{{ t('stats.labels.paymentsCount', { count: item.paymentsCount }) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">{{ t('stats.labels.noActivityChart') }}</div>
      </section>

      <section v-if="dashboard.scope.mode === 'global'" class="panel">
        <div class="panel__header">
          <div>
            <p class="stats-kicker">{{ t('common.clients') }}</p>
            <h3>{{ t('stats.sections.topClients') }}</h3>
          </div>
        </div>

        <div v-if="dashboard.topClients.length" class="leaderboard">
          <div v-for="client in dashboard.topClients" :key="client.clientId" class="leaderboard-row">
            <div>
              <strong>{{ client.clientName }}</strong>
              <span>
                {{ t('stats.labels.appointmentsCount', { count: client.appointmentsCount }) }}, {{ t('stats.labels.paymentsCount', { count: client.paymentsCount }) }}
              </span>
            </div>
            <div class="leaderboard-row__metrics">
              <strong>{{ formatCurrency(client.totalRevenue) }}</strong>
              <span>{{ t('stats.labels.averageCheck', { value: formatCurrency(client.averageCheck) }) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">{{ t('stats.labels.notEnoughClients') }}</div>
      </section>

      <section v-if="dashboard.selectedClient" class="panel client-panel">
        <div class="panel__header">
          <div>
            <p class="stats-kicker">{{ t('stats.sections.clientFocus') }}</p>
            <h3>{{ dashboard.selectedClient.clientName }}</h3>
          </div>
        </div>

        <div class="client-grid">
          <article class="client-card">
            <span>{{ t('stats.metrics.revenue') }}</span>
            <strong>{{ formatCurrency(dashboard.selectedClient.totalRevenue) }}</strong>
          </article>
          <article class="client-card">
            <span>{{ t('stats.metrics.averageCheck') }}</span>
            <strong>{{ formatCurrency(dashboard.selectedClient.averageCheck) }}</strong>
          </article>
          <article class="client-card">
            <span>{{ t('stats.labels.lastPayment') }}</span>
            <strong>
              {{ dashboard.selectedClient.lastPaymentAt ? formatDate(dashboard.selectedClient.lastPaymentAt) : t('stats.labels.none') }}
            </strong>
          </article>
          <article class="client-card">
            <span>{{ t('stats.labels.lastSession') }}</span>
            <strong>
              {{ dashboard.selectedClient.lastAppointmentAt ? formatDate(dashboard.selectedClient.lastAppointmentAt) : t('stats.labels.none') }}
            </strong>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { appointmentStatusColorMap, getAppointmentStatusLabel } from '@/features/appointments/status'
import { ClientsAPI } from '@/features/clients/service'
import type { Client } from '@/features/clients/types'
import { intlLocaleMap, type AppLocale } from '@/i18n'
import { StatsAPI } from '../service'
import type { StatsResponse } from '../types'

const { t, locale } = useI18n()

type ClientOption = {
  title: string
  value: string
}

type RevenuePoint = {
  month: string
  revenue: number
  x: number
  y: number
}

const periodOptions = [3, 6, 12] as const

const isLoading = ref(false)
const errorMessage = ref('')
const selectedClientId = ref<string | null>(null)
const selectedMonths = ref<(typeof periodOptions)[number]>(6)
const dashboard = ref<StatsResponse | null>(null)
const clients = ref<Client[]>([])

const clientOptions = computed<ClientOption[]>(() => {
  return [...clients.value]
    .filter((client) => Boolean(client.id))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((client) => ({
      title: client.name,
      value: client.id as string,
    }))
})

const overviewCards = computed(() => {
  if (!dashboard.value) {
    return []
  }

  const { overview } = dashboard.value

  return [
    {
      title: t('stats.metrics.clients'),
      value: overview.totalClients,
      hint: t('stats.metrics.activeClientsHint', { count: overview.activeClients }),
    },
    {
      title: t('stats.metrics.appointments'),
      value: overview.totalAppointments,
      hint: t('stats.metrics.completedHint', { count: overview.completedAppointments }),
    },
    {
      title: t('stats.metrics.revenue'),
      value: formatCurrency(overview.totalRevenue),
      hint: t('stats.metrics.paymentsHint', { count: overview.totalPayments }),
    },
    {
      title: t('stats.metrics.averageCheck'),
      value: formatCurrency(overview.averageCheck),
      hint: t('stats.metrics.averageCheckHint'),
    },
    {
      title: t('stats.metrics.conversion'),
      value: `${overview.completionRate}%`,
      hint: t('stats.metrics.conversionHint'),
    },
    {
      title: t('stats.metrics.risks'),
      value: `${overview.noShowRate + overview.unreachableRate}%`,
      hint: t('stats.metrics.risksHint'),
    },
  ]
})

const appointmentStatusRows = computed(() => {
  if (!dashboard.value) {
    return []
  }

  const totalAppointments = dashboard.value.overview.totalAppointments

  return dashboard.value.appointmentStatuses.map((item) => ({
    ...item,
    label: getAppointmentStatusLabel(t, item.status),
    color: appointmentStatusColorMap[item.status],
    percent: totalAppointments ? Number(((item.count / totalAppointments) * 100).toFixed(1)) : 0,
  }))
})

const revenuePoints = computed<RevenuePoint[]>(() => {
  if (!dashboard.value?.monthlyStats.length) {
    return []
  }

  const chartWidth = 680
  const chartHeight = 240
  const paddingX = 30
  const paddingTop = 24
  const paddingBottom = 34
  const usableWidth = chartWidth - paddingX * 2
  const usableHeight = chartHeight - paddingTop - paddingBottom
  const maxRevenue = Math.max(...dashboard.value.monthlyStats.map((item) => item.revenue), 1)
  const step = dashboard.value.monthlyStats.length > 1 ? usableWidth / (dashboard.value.monthlyStats.length - 1) : 0

  return dashboard.value.monthlyStats.map((item, index) => ({
    month: item.month,
    revenue: item.revenue,
    x: paddingX + step * index,
    y: paddingTop + (1 - item.revenue / maxRevenue) * usableHeight,
  }))
})

const revenueLinePath = computed(() => {
  if (!revenuePoints.value.length) {
    return ''
  }

  return revenuePoints.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
})

const revenueAreaPath = computed(() => {
  if (!revenuePoints.value.length) {
    return ''
  }

  const baseY = 206
  const start = revenuePoints.value[0]
  const end = revenuePoints.value[revenuePoints.value.length - 1]

  if (!start || !end) {
    return ''
  }

  return `${revenueLinePath.value} L ${end.x} ${baseY} L ${start.x} ${baseY} Z`
})

const activityBars = computed(() => {
  if (!dashboard.value?.monthlyStats.length) {
    return []
  }

  const maxCount = Math.max(
    ...dashboard.value.monthlyStats.flatMap((item) => [item.appointmentsCount, item.paymentsCount]),
    1,
  )

  return dashboard.value.monthlyStats.map((item) => ({
    ...item,
    appointmentsHeight: Number(((item.appointmentsCount / maxCount) * 100).toFixed(1)),
    paymentsHeight: Number(((item.paymentsCount / maxCount) * 100).toFixed(1)),
  }))
})

const insightCards = computed(() => {
  if (!dashboard.value) {
    return []
  }

  const bestRevenueMonth = [...dashboard.value.monthlyStats].sort((left, right) => right.revenue - left.revenue)[0]
  const topPaymentMethod = [...dashboard.value.paymentMethods].sort((left, right) => right.totalAmount - left.totalAmount)[0]
  const mostActiveClient = dashboard.value.topClients[0]
  const riskRate = dashboard.value.overview.noShowRate + dashboard.value.overview.unreachableRate

  return [
    {
      title: t('stats.insights.peakMonth'),
      value: bestRevenueMonth ? formatMonth(bestRevenueMonth.month) : t('stats.insights.noData'),
      hint: bestRevenueMonth ? formatCurrency(bestRevenueMonth.revenue) : t('stats.insights.noRevenue'),
    },
    {
      title: t('stats.insights.paymentMethod'),
      value: topPaymentMethod ? topPaymentMethod.method : t('stats.insights.noData'),
      hint: topPaymentMethod ? formatCurrency(topPaymentMethod.totalAmount) : t('stats.insights.noPayments'),
    },
    {
      title: dashboard.value.scope.mode === 'client' ? t('stats.insights.clientActivity') : t('stats.insights.topClient'),
      value:
        dashboard.value.scope.mode === 'client'
          ? t('stats.labels.appointmentsCount', { count: dashboard.value.selectedClient?.appointmentsCount ?? 0 })
          : mostActiveClient?.clientName ?? t('stats.insights.noData'),
      hint:
        dashboard.value.scope.mode === 'client'
          ? t('stats.insights.paymentsForPeriod', { count: dashboard.value.selectedClient?.paymentsCount ?? 0 })
          : mostActiveClient
            ? formatCurrency(mostActiveClient.totalRevenue)
            : t('stats.insights.noData'),
    },
    {
      title: t('stats.insights.risk'),
      value: `${riskRate}%`,
      hint: riskRate > 20 ? t('stats.insights.riskHigh') : t('stats.insights.riskNormal'),
    },
  ]
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat(intlLocaleMap[locale.value as AppLocale], {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (value: string) => dayjs(value).format('DD.MM.YYYY')
const formatDateTime = (value: string) => dayjs(value).format('DD.MM.YYYY HH:mm')
const formatMonth = (value: string) => dayjs(`${value}-01`).format('MMMM YYYY')
const formatMonthShort = (value: string) => dayjs(`${value}-01`).format('MMM')

const fetchClients = async () => {
  clients.value = await ClientsAPI.getAll()
}

const fetchDashboard = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    dashboard.value = await StatsAPI.getDashboard({
      clientId: selectedClientId.value ?? undefined,
      months: selectedMonths.value,
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error)
    errorMessage.value = t('stats.labels.loadError')
  } finally {
    isLoading.value = false
  }
}

watch([selectedClientId, selectedMonths], () => {
  void fetchDashboard()
})

onMounted(async () => {
  await Promise.all([fetchClients(), fetchDashboard()])
})
</script>

<style scoped>
.stats-page {
  display: grid;
  gap: 20px;
}

.stats-hero,
.scope-banner,
.panel,
.metric-card,
.client-card,
.trend-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
}

.stats-hero,
.scope-banner,
.panel {
  padding: 20px;
}

.stats-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.stats-kicker {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.stats-hero h1,
.scope-banner h2,
.panel h3 {
  margin: 0;
  color: #0f172a;
}

.stats-subtitle {
  margin: 10px 0 0;
  max-width: 760px;
  color: #475569;
}

.stats-toolbar {
  min-width: 320px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.period-switcher {
  display: flex;
  gap: 8px;
  align-items: center;
}

.scope-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.scope-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
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

.stats-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.insights-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card {
  display: grid;
  gap: 6px;
  padding: 18px;
}

.insight-card {
  display: grid;
  gap: 6px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
}

.insight-card__eyebrow {
  color: rgba(248, 250, 252, 0.72);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.insight-card__value {
  font-size: 24px;
}

.insight-card__hint {
  color: rgba(248, 250, 252, 0.8);
}

.metric-card__title,
.metric-card__hint {
  color: #64748b;
}

.metric-card__value {
  font-size: 26px;
  color: #0f172a;
}

.stats-layout {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 1fr;
}

.panel__header {
  margin-bottom: 16px;
}

.stack-list,
.leaderboard {
  display: grid;
  gap: 12px;
}

.stack-row {
  display: grid;
  gap: 8px;
}

.stack-row__meta,
.method-row,
.leaderboard-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.method-row,
.leaderboard-row {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.method-row:last-child,
.leaderboard-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.method-row span,
.leaderboard-row span {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.leaderboard-row__metrics {
  text-align: right;
}

.chart-panel {
  display: grid;
  gap: 14px;
}

.revenue-chart {
  width: 100%;
  height: 240px;
  overflow: visible;
}

.revenue-chart__area {
  fill: rgba(37, 99, 235, 0.14);
}

.revenue-chart__line {
  fill: none;
  stroke: #2563eb;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.revenue-chart__point {
  fill: #0f172a;
  stroke: #ffffff;
  stroke-width: 2;
}

.chart-labels {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
}

.chart-label {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.08);
}

.chart-label span,
.activity-meta span {
  color: #64748b;
  font-size: 13px;
}

.activity-chart {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

.activity-group {
  display: grid;
  gap: 10px;
}

.activity-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: end;
  min-height: 180px;
}

.activity-bar-shell {
  display: flex;
  align-items: end;
  height: 180px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.08);
}

.activity-bar {
  width: 100%;
  border-radius: 10px;
  min-height: 6px;
}

.activity-bar--appointments {
  background: linear-gradient(180deg, #2563eb, #1d4ed8);
}

.activity-bar--payments {
  background: linear-gradient(180deg, #14b8a6, #0f766e);
}

.activity-meta {
  display: grid;
  gap: 2px;
}

.trend-grid,
.client-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.trend-card,
.client-card {
  display: grid;
  gap: 6px;
  padding: 16px;
}

.trend-card__month,
.client-card span {
  color: #64748b;
  text-transform: capitalize;
}

.client-card strong {
  font-size: 22px;
  color: #0f172a;
}

.stats-loading,
.empty-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  color: #64748b;
}

@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .insights-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .trend-grid,
  .client-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .stats-hero,
  .scope-banner,
  .stats-layout {
    display: grid;
    grid-template-columns: 1fr;
  }

  .stats-toolbar {
    min-width: 0;
    display: grid;
    grid-template-columns: 1fr auto;
  }
}

@media (max-width: 720px) {
  .stats-grid,
  .insights-grid,
  .trend-grid,
  .client-grid,
  .stats-toolbar,
  .scope-meta {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
