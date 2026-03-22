<template>
  <div class="d-flex ga-4 mb-4 flex-wrap">
    <v-text-field
      v-model="localFilters.search"
      :label="t('clients.searchByName')"
      density="compact"
      clearable
    />
    <v-text-field v-model="localFilters.email" :label="t('clients.emailSearch')" density="compact" clearable />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  filters: { search: string; email: string }
}>()

const emit = defineEmits<{
  (e: 'update:filters', v: typeof props.filters): void
}>()

const localFilters = reactive({ ...props.filters })

watch(localFilters, (val) => emit('update:filters', val), { deep: true })
</script>
