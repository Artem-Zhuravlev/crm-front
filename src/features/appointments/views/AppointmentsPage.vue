<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">Записи</h2>
      <v-btn color="primary" @click="openCreate">Додати запис</v-btn>
    </div>

    <AppointmentsFilters
      v-model:search="filters.search"
      v-model:status="filters.status"
      v-model:date="filters.date"
      :status-options="statusOptions"
    />

    <AppointmentsTable :items="filteredAppointments" @edit="openEdit" @delete="deleteAppointment" />

    <AppointmentForm
      v-model="dialog"
      :appointment="editingAppointment"
      :status-options="statusOptions"
      @save="saveAppointment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppointmentsTable from '../components/AppointmentsTabe.vue'
import AppointmentForm from '../components/AppointmentsForm.vue'
import AppointmentsFilters from '../components/AppointmentsFilters.vue'
import type { Appointment } from '../types'

const dialog = ref(false)
const editingAppointment = ref<Appointment | null>(null)

const filters = ref({
  search: '',
  status: null as string | null,
  date: '',
})

const statusOptions = ['Заплановано', 'Виконано', 'Скасовано']

const appointments = ref<Appointment[]>([
  {
    id: 1,
    client: 'Іван Петренко',
    service: 'Тату на руці',
    date: '2026-01-24',
    time: '14:00',
    status: 'Заплановано',
  },
  {
    id: 2,
    client: 'Олена Коваль',
    service: 'Консультація',
    date: '2026-01-25',
    time: '10:30',
    status: 'Виконано',
  },
])

const filteredAppointments = computed(() => {
  return appointments.value.filter((a) => {
    const matchSearch = filters.value.search
      ? a.client.toLowerCase().includes(filters.value.search.toLowerCase())
      : true

    const matchStatus = filters.value.status ? a.status === filters.value.status : true

    const matchDate = filters.value.date ? a.date === filters.value.date : true

    return matchSearch && matchStatus && matchDate
  })
})

const openCreate = () => {
  editingAppointment.value = null
  dialog.value = true
}

const openEdit = (item: Appointment) => {
  editingAppointment.value = { ...item }
  dialog.value = true
}

const saveAppointment = (data: Appointment) => {
  if (data.id) {
    const index = appointments.value.findIndex((a) => a.id === data.id)
    if (index !== -1) {
      appointments.value[index] = data
    }
  } else {
    appointments.value.push({
      ...data,
      id: Date.now(),
    })
  }

  dialog.value = false
}

const deleteAppointment = (id: number) => {
  appointments.value = appointments.value.filter((a) => a.id !== id)
}
</script>
