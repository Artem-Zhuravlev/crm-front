<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">{{ t('payments.pageTitle') }}</h2>
      <v-btn color="primary" @click="openCreate">{{ t('payments.add') }}</v-btn>
    </div>

    <PaymentsFilters v-model:filters="filters" :clients="clients" />

    <PaymentsTable
      :items="filteredPayments"
      :clients="clients"
      @edit="editPayment"
      @delete="deletePayment"
    />

    <PaymentsDialog
      v-model:open="dialog"
      :payment="form"
      :clients="clients"
      @save="savePayment"
      @update:payment="form = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import type { Payment, PaymentFormValues, PaymentPayload } from '../types'
import type { Client } from '@/features/clients/types'
import { ClientsAPI } from '@/features/clients/service'
import PaymentsFilters from '../components/PaymentsFilters.vue'
import PaymentsTable from '../components/PaymentsTable.vue'
import PaymentsDialog from '../components/PaymentsDialog.vue'
import { PaymentsAPI } from '../service'

const { t } = useI18n()

const dialog = ref(false)
const createEmptyForm = (): PaymentFormValues => ({
  clientId: '',
  amount: 0,
  date: '',
  time: '',
  method: '',
})

const form = ref<PaymentFormValues>(createEmptyForm())
const clients = ref<Client[]>([])
const payments = ref<Payment[]>([])

const filters = ref({
  clientId: null as string | null,
  method: '',
  date: '',
})

const toFormValues = (payment: Payment): PaymentFormValues => ({
  id: payment.id,
  clientId: payment.clientId,
  amount: Number(payment.amount),
  date: dayjs(payment.date).format('YYYY-MM-DD'),
  time: dayjs(payment.date).format('HH:mm'),
  method: payment.method || '',
})

const toPayload = (payment: PaymentFormValues): PaymentPayload => ({
  clientId: payment.clientId,
  amount: Number(payment.amount),
  date: `${payment.date}T${payment.time || '00:00'}:00`,
  method: payment.method.trim() || undefined,
})

const filteredPayments = computed(() => {
  return payments.value.filter((p) => {
    const matchClient = filters.value.clientId ? p.clientId === filters.value.clientId : true
    const matchMethod = filters.value.method
      ? (p.method || '').toLowerCase().includes(filters.value.method.toLowerCase())
      : true
    const matchDate = filters.value.date
      ? dayjs(p.date).format('YYYY-MM-DD') === filters.value.date
      : true
    return matchClient && matchMethod && matchDate
  })
})

const fetchData = async () => {
  try {
    const [paymentsResponse, clientsResponse] = await Promise.all([
      PaymentsAPI.getAll(),
      ClientsAPI.getAll(),
    ])

    payments.value = paymentsResponse
    clients.value = clientsResponse
  } catch (err) {
    console.error('Не удалось загрузить платежи', err)
  }
}

const openCreate = () => {
  form.value = createEmptyForm()
  dialog.value = true
}

const savePayment = async (payment: PaymentFormValues) => {
  try {
    const payload = toPayload(payment)

    if (payment.id) {
      const updatedPayment = await PaymentsAPI.update(payment.id, payload)
      const idx = payments.value.findIndex((p) => p.id === payment.id)
      if (idx !== -1) payments.value[idx] = updatedPayment
    } else {
      const createdPayment = await PaymentsAPI.create(payload)
      payments.value.unshift(createdPayment)
    }

    dialog.value = false
  } catch (err) {
    console.error('Ошибка при сохранении платежа', err)
  }
}

const editPayment = (payment: Payment) => {
  form.value = toFormValues(payment)
  dialog.value = true
}

const deletePayment = async (id: string) => {
  try {
    await PaymentsAPI.remove(id)
    payments.value = payments.value.filter((p) => p.id !== id)
  } catch (err) {
    console.error('Ошибка при удалении платежа', err)
  }
}

onMounted(fetchData)
</script>
