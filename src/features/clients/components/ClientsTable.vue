<template>
  <v-data-table :headers="headers" :items="items" item-key="id" class="elevation-1">
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
import type { Client } from '../types'

const props = defineProps<{
  items: Client[]
}>()

const headers = [
  { title: "Ім'я", key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Телефон', key: 'phone' },
  { title: 'Дії', key: 'actions', sortable: false },
]
</script>
