<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <span class="text-h6">
          {{ form.id ? 'Редагувати запис' : 'Новий запис' }}
        </span>
      </v-card-title>

      <v-card-text>
        <v-text-field v-model="form.client" label="Клієнт" />
        <v-text-field v-model="form.service" label="Послуга" />
        <v-text-field v-model="form.date" type="date" label="Дата" />
        <v-text-field v-model="form.time" type="time" label="Час" />
        <v-select v-model="form.status" :items="statusOptions" label="Статус" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Скасувати</v-btn>
        <v-btn color="primary" @click="save">Зберегти</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Appointment } from '../types'

const props = defineProps<{
  modelValue: boolean
  appointment: Appointment | null
  statusOptions: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: Appointment): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const form = ref<Appointment>({
  id: 0,
  client: '',
  service: '',
  date: '',
  time: '',
  status: 'Заплановано',
})

const reset = () => {
  form.value = {
    id: 0,
    client: '',
    service: '',
    date: '',
    time: '',
    status: 'Заплановано',
  }
}

watch(
  () => props.appointment,
  (value) => {
    if (value) {
      form.value = { ...value }
    } else {
      reset()
    }
  },
  { immediate: true },
)

const close = () => {
  dialog.value = false
}

const save = () => {
  if (!form.value.client || !form.value.date || !form.value.time) return
  emit('save', { ...form.value })
}
</script>
