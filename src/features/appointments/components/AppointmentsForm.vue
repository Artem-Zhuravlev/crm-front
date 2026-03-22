<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <span class="text-h6">
          {{ form.id ? t('appointments.edit') : t('appointments.new') }}
        </span>
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="form.clientId"
          :items="clients"
          item-title="name"
          item-value="id"
          :label="t('common.client')"
        />
        <v-text-field v-model="form.title" :label="t('appointments.titleLabel')" />
        <v-textarea v-model="form.description" :label="t('appointments.descriptionLabel')" rows="3" />
        <v-text-field v-model="form.date" type="date" :label="t('common.date')" />
        <v-text-field v-model="form.time" type="time" :label="t('common.time')" />
        <v-select
          v-model="form.status"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          :label="t('common.status')"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" @click="save">{{ t('common.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Client } from '@/features/clients/types'
import type { AppointmentFormValues } from '../types'
import type { AppointmentStatus } from '../status'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  appointment: AppointmentFormValues | null
  clients: Client[]
  statusOptions: Array<{ title: string; value: AppointmentStatus }>
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
  status: 'scheduled',
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
  form.value.title = form.value.title.trim()
  form.value.description = form.value.description.trim()

  if (!form.value.clientId || !form.value.title || !form.value.date || !form.value.time) return
  emit('save', { ...form.value })
}
</script>
