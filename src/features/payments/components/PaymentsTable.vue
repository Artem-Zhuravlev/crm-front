<template>
  <v-data-table :headers="headers" :items="items" item-key="id" class="elevation-1">
    <template #item.clientId="{ item }">
      {{ getClientName(item.clientId) }}
    </template>

    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)" size="small">{{ item.status }}</v-chip>
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
import type { Payment } from '../types'
import type { Client } from '@/features/clients/types'

const props = defineProps<{
  items: Payment[]
  clients?: Client[]
}>()

const headers = [
  { title: 'Клієнт', key: 'clientId' },
  { title: 'Сума', key: 'amount' },
  { title: 'Дата', key: 'date' },
  { title: 'Статус', key: 'status' },
  { title: 'Дії', key: 'actions', sortable: false },
]

const getClientName = (id: number) => {
  return props.clients?.find((c) => c.id === id)?.name || '–'
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Оплачено':
      return 'green'
    case 'Очікує':
      return 'orange'
    case 'Скасовано':
      return 'red'
    default:
      return 'grey'
  }
}
</script>
