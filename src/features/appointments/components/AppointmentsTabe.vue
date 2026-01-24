<template>
  <v-data-table :headers="headers" :items="items" item-key="id" class="elevation-1">
    <template #item.status="{ item }">
      <v-chip :color="statusColor(item.status)" size="small">
        {{ item.status }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex flex ga-2">
        <v-btn icon size="small" @click="$emit('edit', item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon size="small" color="red" @click="$emit('delete', item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { Appointment } from '../types'

defineProps<{
  items: Appointment[]
}>()

defineEmits<{
  (e: 'edit', item: Appointment): void
  (e: 'delete', id: number): void
}>()

const headers = [
  { title: 'Дата', key: 'date' },
  { title: 'Час', key: 'time' },
  { title: 'Клієнт', key: 'client' },
  { title: 'Послуга', key: 'service' },
  { title: 'Статус', key: 'status' },
  { title: 'Дії', key: 'actions', sortable: false },
]

const statusColor = (status: string) => {
  switch (status) {
    case 'Заплановано':
      return 'blue'
    case 'Виконано':
      return 'green'
    case 'Скасовано':
      return 'red'
    default:
      return 'grey'
  }
}
</script>
