<template>
  <v-data-table :headers="headers" :items="items" item-key="id" class="elevation-1">
    <template #item.actions="{ item }">
      <div class="d-flex ga-3">
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Client } from '../types'

const props = defineProps<{
  items: Client[]
}>()

const { t } = useI18n()

const headers = computed(() => [
  { title: t('clients.name'), key: 'name' },
  { title: 'Email', key: 'email' },
  { title: t('clients.phone'), key: 'phone' },
  { title: t('common.actions'), key: 'actions', sortable: false },
])
</script>
