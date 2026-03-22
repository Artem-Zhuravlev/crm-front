<template>
  <div class="d-flex ga-3 mb-4 flex-wrap">
    <v-select
      v-model="localFilters.clientId"
      :items="clientsOptions"
      item-title="name"
      item-value="id"
      :label="t('common.client')"
      clearable
    />
    <v-text-field v-model="localFilters.method" :label="t('payments.methodLabel')" clearable />
    <v-text-field v-model="localFilters.date" type="date" :label="t('common.date')" clearable />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Client } from '@/features/clients/types'

const { t } = useI18n()

const props = defineProps<{
  filters: { clientId: string | null; method: string; date: string }
  clients?: Client[]
}>()

const emit = defineEmits<{
  (e: 'update:filters', v: typeof props.filters): void
}>()

const localFilters = reactive({ ...props.filters })

watch(localFilters, (val) => emit('update:filters', val), { deep: true })

watch(
  () => props.filters,
  (val) => Object.assign(localFilters, val),
  { deep: true },
)

const clientsOptions = computed(() => props.clients || [])
</script>
