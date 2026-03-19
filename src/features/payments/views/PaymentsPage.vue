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
  clientId: '',
  amount: 0,
  date: '',
  status: 'Оплачено',
})

const clients: Client[] = [
  {
    id: '6f9d3f0a-30e8-4f44-a4f9-3ccf18f8cc5d',
    name: 'Іван Петренко',
    email: 'ivan@mail.com',
    phone: '0991234567',
  },
  {
    id: '8c7d4f9e-1f83-4e03-b3a8-f45d38e84c79',
    name: 'Олена Коваль',
    email: 'olena@mail.com',
    phone: '0669876543',
  },
]

const filters = ref({
  clientId: null as string | null,
  status: null as string | null,
  date: '',
})

const payments = ref<Payment[]>([
  {
    id: '1f5fe5df-0d8a-48a4-a90e-c87b82f8ab0e',
    clientId: '6f9d3f0a-30e8-4f44-a4f9-3ccf18f8cc5d',
    amount: 500,
    date: '2026-01-24',
    status: 'Оплачено',
  },
  {
    id: '5b9384cd-d358-4ddf-9be6-18db530f9361',
    clientId: '8c7d4f9e-1f83-4e03-b3a8-f45d38e84c79',
    amount: 300,
    date: '2026-01-25',
    status: 'Очікує',
  },
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
  form.value = { clientId: '', amount: 0, date: '', status: 'Оплачено' }
  dialog.value = true
}

const savePayment = (payment: Payment) => {
  if (payment.id) {
    const idx = payments.value.findIndex((p) => p.id === payment.id)
    if (idx !== -1) payments.value[idx] = { ...payment }
  } else {
    payments.value.push({ ...payment, id: crypto.randomUUID() })
  }
  dialog.value = false
}

const editPayment = (payment: Payment) => {
  form.value = { ...payment }
  dialog.value = true
}

const deletePayment = (id: string) => {
  payments.value = payments.value.filter((p) => p.id !== id)
}
</script>
