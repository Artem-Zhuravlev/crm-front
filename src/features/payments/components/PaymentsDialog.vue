<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ payment.id ? 'Редагувати платіж' : 'Новий платіж' }}</span>
      </v-card-title>

      <v-card-text>
        <v-select v-model="localPayment.clientId" :items="clientsOptions" label="Клієнт" dense />
        <v-text-field v-model="localPayment.amount" label="Сума" type="number" dense />
        <v-text-field v-model="localPayment.date" label="Дата" type="date" dense />
        <v-select
          v-model="localPayment.status"
          :items="['Оплачено', 'Очікує', 'Скасовано']"
          label="Статус"
          dense
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">Скасувати</v-btn>
        <v-btn color="primary" @click="save">Зберегти</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { Payment } from '../types'
import type { Client } from '@/features/clients/types'

const props = defineProps<{
  open: boolean
  payment: Payment
  clients: Client[]
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'update:payment', v: Payment): void
  (e: 'save', v: Payment): void
}>()

const dialog = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

const localPayment = reactive({ ...props.payment })

watch(
  () => props.payment,
  (val) => Object.assign(localPayment, val),
  { immediate: true },
)

watch(localPayment, (val) => emit('update:payment', val), { deep: true })

const close = () => (dialog.value = false)
const save = () => emit('save', { ...localPayment })

const clientsOptions = computed(() => props.clients.map((c) => ({ label: c.name, value: c.id })))
</script>
