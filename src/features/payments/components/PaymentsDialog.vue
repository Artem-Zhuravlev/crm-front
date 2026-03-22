<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ payment.id ? t('payments.edit') : t('payments.new') }}</span>
      </v-card-title>

      <v-card-text>
        <v-select
          v-model="localPayment.clientId"
          :items="clients"
          item-title="name"
          item-value="id"
          :label="t('common.client')"
        />
        <v-text-field v-model.number="localPayment.amount" :label="t('common.amount')" type="number" />
        <v-text-field v-model="localPayment.date" :label="t('common.date')" type="date" />
        <v-text-field v-model="localPayment.time" :label="t('common.time')" type="time" />
        <v-text-field v-model="localPayment.method" :label="t('payments.methodLabel')" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="close">{{ t('common.cancel') }}</v-btn>
        <v-btn color="primary" @click="save">{{ t('common.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PaymentFormValues } from '../types'
import type { Client } from '@/features/clients/types'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  payment: PaymentFormValues
  clients: Client[]
}>()

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'update:payment', v: PaymentFormValues): void
  (e: 'save', v: PaymentFormValues): void
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

const save = () => {
  if (!localPayment.clientId || !localPayment.date || !localPayment.time) return
  emit('save', { ...localPayment })
}
</script>
