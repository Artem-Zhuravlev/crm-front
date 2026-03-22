<template>
  <v-data-table :headers="headers" :items="items" item-key="id" class="elevation-1">
    <template #item.clientId="{ item }">
      {{ getClientName(item.clientId) }}
    </template>

    <template #item.date="{ item }">
      {{ formatDate(item.date) }}
    </template>

    <template #item.time="{ item }">
      {{ formatTime(item.date) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn icon size="small" @click="$emit('edit', item)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon size="small" color="red" @click="$emit('delete', item.id)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Payment } from '../types'
import type { Client } from '@/features/clients/types'

const props = defineProps<{
  items: Payment[]
  clients?: Client[]
}>()

const { t } = useI18n()

const headers = computed(() => [
  { title: t('common.client'), key: 'clientId' },
  { title: t('common.amount'), key: 'amount' },
  { title: t('common.date'), key: 'date' },
  { title: t('common.time'), key: 'time' },
  { title: t('common.method'), key: 'method' },
  { title: t('common.actions'), key: 'actions', sortable: false },
])

const getClientName = (id: string) => {
  return props.clients?.find((c) => c.id === id)?.name || '–'
}

const formatDate = (value: string) => dayjs(value).format('DD.MM.YYYY')
const formatTime = (value: string) => dayjs(value).format('HH:mm')
</script>
