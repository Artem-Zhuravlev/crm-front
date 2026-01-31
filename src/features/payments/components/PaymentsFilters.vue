<template>
  <div class="d-flex ga-3 mb-4 flex-wrap">
    <v-select
      v-model="localFilters.clientId"
      :items="clientsOptions"
      label="Клієнт"
      clearable
      dense
    />
    <v-select
      v-model="localFilters.status"
      :items="['Оплачено', 'Очікує', 'Скасовано']"
      label="Статус"
      clearable
      dense
    />
    <v-text-field v-model="localFilters.date" type="date" label="Дата" dense clearable />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { Client } from '@/features/clients/types'

const props = defineProps<{
  filters: { clientId: number | null; status: string | null; date: string }
  clients?: Client[]
}>()

const emit = defineEmits<{
  (e: 'update:filters', v: typeof props.filters): void
}>()

const localFilters = reactive({ ...props.filters })

watch(localFilters, (val) => emit('update:filters', val), { deep: true })

const clientsOptions = computed(
  () => props.clients?.map((c) => ({ label: c.name, value: c.id })) || [],
)
</script>
