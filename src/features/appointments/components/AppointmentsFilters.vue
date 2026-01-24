<template>
  <div class="d-flex ga-3 mb-4 flex-wrap">
    <v-text-field v-model="searchModel" label="Пошук клієнта" density="compact" clearable />

    <v-select
      v-model="statusModel"
      :items="statusOptions"
      label="Статус"
      density="compact"
      clearable
    />

    <v-text-field v-model="dateModel" type="date" label="Дата" density="compact" clearable />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  search: string
  status: string | null
  date: string
  statusOptions: string[]
}>()

const emit = defineEmits<{
  (e: 'update:search', v: string): void
  (e: 'update:status', v: string | null): void
  (e: 'update:date', v: string): void
}>()

const searchModel = computed({
  get: () => props.search,
  set: (v) => emit('update:search', v),
})

const statusModel = computed({
  get: () => props.status,
  set: (v) => emit('update:status', v),
})

const dateModel = computed({
  get: () => props.date,
  set: (v) => emit('update:date', v),
})
</script>
