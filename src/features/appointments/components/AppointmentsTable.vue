<template>
  <v-data-table :headers="headers" :items="items" item-key="id" class="elevation-1">
    <template #item.date="{ item }">
      {{ formatDate(item.date) }}
    </template>

    <template #item.time="{ item }">
      {{ formatTime(item.date) }}
    </template>

    <template #item.client="{ item }">
      {{ item.client?.name || '—' }}
    </template>

    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)" size="small">
        {{ statusLabel(item.status) }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex flex ga-2">
        <v-btn icon size="small" @click="$emit('edit', item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="small" color="red" @click="item.id && $emit('delete', item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Appointment } from '../types'
import { appointmentStatusColorMap, getAppointmentStatusLabel, type AppointmentStatus } from '../status'

const { t } = useI18n()

defineProps<{
  items: Appointment[]
}>()

defineEmits<{
  (e: 'edit', item: Appointment): void
  (e: 'delete', id: string): void
}>()

const headers = computed(() => [
  { title: t('common.date'), key: 'date' },
  { title: t('common.time'), key: 'time' },
  { title: t('common.client'), key: 'client' },
  { title: t('common.title'), key: 'title' },
  { title: t('common.description'), key: 'description' },
  { title: t('common.status'), key: 'status' },
  { title: t('common.actions'), key: 'actions', sortable: false },
])

const formatDate = (value: string) => dayjs(value).format('DD.MM.YYYY')
const formatTime = (value: string) => dayjs(value).format('HH:mm')

const statusColor = (status: AppointmentStatus) => appointmentStatusColorMap[status]
const statusLabel = (status: AppointmentStatus) => getAppointmentStatusLabel(t, status)
</script>
