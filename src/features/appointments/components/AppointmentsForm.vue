<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <span class="text-h6">
          {{ form.id ? 'Редагувати запис' : 'Новий запис' }}
        </span>
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="form.clientId"
          :items="clients"
          item-title="name"
          item-value="id"
          label="Клієнт"
        />
        <v-text-field v-model="form.title" label="Назва запису" />
        <v-textarea v-model="form.description" label="Опис" rows="3" />
        <v-text-field v-model="form.date" type="date" label="Дата" />
        <v-text-field v-model="form.time" type="time" label="Час" />
        <v-select
          v-model="form.completed"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          label="Статус"
        />
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
import type { Client } from '@/features/clients/types'
import type { AppointmentFormValues } from '../types'

const props = defineProps<{
  modelValue: boolean
  appointment: AppointmentFormValues | null
  clients: Client[]
  statusOptions: Array<{ title: string; value: boolean }>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', v: AppointmentFormValues): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const createEmptyForm = (): AppointmentFormValues => ({
  clientId: '',
  title: '',
  description: '',
  date: '',
  time: '',
  completed: false,
})

const form = ref<AppointmentFormValues>(createEmptyForm())

const reset = () => {
  form.value = createEmptyForm()
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
  if (!form.value.clientId || !form.value.title || !form.value.date || !form.value.time) return
  emit('save', { ...form.value })
}
</script>
