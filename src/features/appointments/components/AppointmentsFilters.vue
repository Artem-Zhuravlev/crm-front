<template>
  <div class="appointments-filters">
    <v-text-field v-model="searchModel" :label="t('appointments.filters.search')" density="compact" clearable hide-details />

    <v-select
      v-model="clientIdModel"
      :items="clientOptions"
      item-title="title"
      item-value="value"
      :label="t('appointments.filters.client')"
      density="compact"
      clearable
      hide-details
    />

    <v-select
      v-model="statusModel"
      :items="statusOptions"
      item-title="title"
      item-value="value"
      :label="t('appointments.filters.status')"
      density="compact"
      clearable
      hide-details
    />

    <v-select
      v-model="yearModel"
      :items="yearOptions"
      item-title="title"
      item-value="value"
      :label="t('appointments.filters.year')"
      density="compact"
      clearable
      hide-details
    />

    <v-select
      v-model="monthModel"
      :items="monthOptions"
      item-title="title"
      item-value="value"
      :label="t('appointments.filters.month')"
      density="compact"
      clearable
      hide-details
    />

    <v-select
      v-model="weekModel"
      :items="weekOptions"
      item-title="title"
      item-value="value"
      :label="t('appointments.filters.week')"
      density="compact"
      clearable
      hide-details
    />

    <v-text-field v-model="dateModel" type="date" :label="t('appointments.filters.date')" density="compact" clearable hide-details />

    <v-btn variant="text" color="primary" @click="$emit('reset')">{{ t('common.reset') }}</v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  search: string
  clientId: string | null
  status: string | null
  year: number | null
  month: number | null
  week: number | null
  date: string
  clientOptions: Array<{ title: string; value: string }>
  statusOptions: Array<{ title: string; value: string }>
  yearOptions: Array<{ title: string; value: number }>
  monthOptions: Array<{ title: string; value: number }>
  weekOptions: Array<{ title: string; value: number }>
}>()

const emit = defineEmits<{
  (e: 'update:search', v: string): void
  (e: 'update:clientId', v: string | null): void
  (e: 'update:status', v: string | null): void
  (e: 'update:year', v: number | null): void
  (e: 'update:month', v: number | null): void
  (e: 'update:week', v: number | null): void
  (e: 'update:date', v: string): void
  (e: 'reset'): void
}>()

const searchModel = computed({
  get: () => props.search,
  set: (v) => emit('update:search', v),
})

const clientIdModel = computed({
  get: () => props.clientId,
  set: (v) => emit('update:clientId', v),
})

const statusModel = computed({
  get: () => props.status,
  set: (v) => emit('update:status', v),
})

const yearModel = computed({
  get: () => props.year,
  set: (v) => emit('update:year', v),
})

const monthModel = computed({
  get: () => props.month,
  set: (v) => emit('update:month', v),
})

const weekModel = computed({
  get: () => props.week,
  set: (v) => emit('update:week', v),
})

const dateModel = computed({
  get: () => props.date,
  set: (v) => emit('update:date', v),
})
</script>

<style scoped>
.appointments-filters {
  display: grid;
  grid-template-columns: repeat(7, minmax(120px, 1fr)) auto;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

@media (max-width: 1400px) {
  .appointments-filters {
    grid-template-columns: repeat(4, minmax(140px, 1fr));
  }
}

@media (max-width: 900px) {
  .appointments-filters {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
}

@media (max-width: 640px) {
  .appointments-filters {
    grid-template-columns: 1fr;
  }
}
</style>
