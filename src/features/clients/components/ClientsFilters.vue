<template>
  <div class="d-flex ga-4 mb-4 flex-wrap">
    <v-text-field
      v-model="localFilters.search"
      label="Пошук за іменем"
      density="compact"
      clearable
    />
    <v-text-field v-model="localFilters.email" label="Пошук за email" density="compact" clearable />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  filters: { search: string; email: string }
}>()

const emit = defineEmits<{
  (e: 'update:filters', v: typeof props.filters): void
}>()

const localFilters = reactive({ ...props.filters })

watch(localFilters, (val) => emit('update:filters', val), { deep: true })
</script>
