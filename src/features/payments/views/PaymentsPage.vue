<template>
  <div>
    <!-- Заголовок и кнопка -->
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">Платежі</h2>
      <v-btn color="primary" @click="openCreate">Додати платіж</v-btn>
    </div>

    <!-- Фильтры -->
    <PaymentsFilters v-model:filters="filters" />

    <!-- Таблица -->
    <PaymentsTable :items="filteredPayments" @edit="editPayment" @delete="deletePayment" />

    <!-- Диалог -->
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
import { ref, computed } from 'vue'
import type { Payment } from '../types'
import type { Client } from '@/features/clients/types'
import PaymentsFilters from '../components/PaymentsFilters.vue'
import PaymentsTable from '../components/PaymentsTable.vue'
import PaymentsDialog from '../components/PaymentsDialog.vue'

const dialog = ref(false)
const form = ref<Payment>({
  id: 0,
  clientId: 0,
  amount: 0,
  date: '',
  status: 'Оплачено',
})

const clients: Client[] = [
  { id: 1, name: 'Іван Петренко', email: 'ivan@mail.com', phone: '0991234567' },
  { id: 2, name: 'Олена Коваль', email: 'olena@mail.com', phone: '0669876543' },
]

const filters = ref({
  clientId: null as number | null,
  status: null as string | null,
  date: '',
})

const payments = ref<Payment[]>([
  { id: 1, clientId: 1, amount: 500, date: '2026-01-24', status: 'Оплачено' },
  { id: 2, clientId: 2, amount: 300, date: '2026-01-25', status: 'Очікує' },
])

const filteredPayments = computed(() => {
  return payments.value.filter((p) => {
    const matchClient = filters.value.clientId ? p.clientId === filters.value.clientId : true
    const matchStatus = filters.value.status ? p.status === filters.value.status : true
    const matchDate = filters.value.date ? p.date === filters.value.date : true
    return matchClient && matchStatus && matchDate
  })
})

const openCreate = () => {
  form.value = { id: 0, clientId: 0, amount: 0, date: '', status: 'Оплачено' }
  dialog.value = true
}

const savePayment = (payment: Payment) => {
  if (payment.id) {
    const idx = payments.value.findIndex((p) => p.id === payment.id)
    if (idx !== -1) payments.value[idx] = { ...payment }
  } else {
    payments.value.push({ ...payment, id: Date.now() })
  }
  dialog.value = false
}

const editPayment = (payment: Payment) => {
  form.value = { ...payment }
  dialog.value = true
}

const deletePayment = (id: number) => {
  payments.value = payments.value.filter((p) => p.id !== id)
}
</script>
