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
      <v-chip :color="statusColor(item.completed)" size="small">
        {{ item.completed ? 'Виконано' : 'Заплановано' }}
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
import type { Appointment } from '../types'

defineProps<{
  items: Appointment[]
}>()

defineEmits<{
  (e: 'edit', item: Appointment): void
  (e: 'delete', id: string): void
}>()

const headers = [
  { title: 'Дата', key: 'date' },
  { title: 'Час', key: 'time' },
  { title: 'Клієнт', key: 'client' },
  { title: 'Назва', key: 'title' },
  { title: 'Опис', key: 'description' },
  { title: 'Статус', key: 'status' },
  { title: 'Дії', key: 'actions', sortable: false },
]

const formatDate = (value: string) => dayjs(value).format('DD.MM.YYYY')
const formatTime = (value: string) => dayjs(value).format('HH:mm')

const statusColor = (completed: boolean) => (completed ? 'green' : 'blue')
</script>
