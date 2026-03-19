<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">Записи</h2>
      <v-btn color="primary" @click="openCreate">Додати запис</v-btn>
    </div>

    <appointments-filters
      v-model:search="filters.search"
      v-model:status="filters.status"
      v-model:date="filters.date"
      :status-options="filterStatusOptions"
    />

    <appointments-table
      :items="filteredAppointments"
      @edit="openEdit"
      @delete="deleteAppointment"
    />

    <appointments-form
      v-model="dialog"
      :appointment="editingAppointment"
      :clients="clients"
      :status-options="statusOptions"
      @save="saveAppointment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import type { Client } from '@/features/clients/types'
import { ClientsAPI } from '@/features/clients/service'
import type { Appointment, AppointmentFormValues, AppointmentPayload } from '../types'
import AppointmentsTable from '../components/AppointmentsTable.vue'
import AppointmentsForm from '../components/AppointmentsForm.vue'
import AppointmentsFilters from '../components/AppointmentsFilters.vue'
import { AppointmentsAPI } from '../service'

const dialog = ref(false)
const editingAppointment = ref<AppointmentFormValues | null>(null)
const appointments = ref<Appointment[]>([])
const clients = ref<Client[]>([])

const filters = ref({
  search: '',
  status: null as string | null,
  date: '',
})

const statusOptions = [
  { title: 'Заплановано', value: false },
  { title: 'Виконано', value: true },
]

const filterStatusOptions = statusOptions.map((option) => option.title)

const createEmptyForm = (): AppointmentFormValues => ({
  clientId: '',
  title: '',
  description: '',
  date: '',
  time: '',
  completed: false,
})

const toFormValues = (appointment: Appointment): AppointmentFormValues => ({
  id: appointment.id,
  clientId: appointment.client.id || '',
  title: appointment.title,
  description: appointment.description || '',
  date: dayjs(appointment.date).format('YYYY-MM-DD'),
  time: dayjs(appointment.date).format('HH:mm'),
  completed: appointment.completed,
})

const toPayload = (form: AppointmentFormValues): AppointmentPayload => ({
  clientId: form.clientId,
  title: form.title.trim(),
  description: form.description.trim() || undefined,
  date: `${form.date}T${form.time}:00`,
  completed: form.completed,
})

const filteredAppointments = computed(() => {
  const searchLower = filters.value.search?.toLowerCase() || ''

  return appointments.value.filter((a) => {
    const matchesStatus =
      !filters.value.status ||
      (filters.value.status === 'Виконано' ? a.completed : !a.completed)

    return (
      `${a.client?.name || ''} ${a.title} ${a.description || ''}`
        .toLowerCase()
        .includes(searchLower) &&
      matchesStatus &&
      (!filters.value.date || dayjs(a.date).format('YYYY-MM-DD') === filters.value.date)
    )
  })
})

const fetchData = async () => {
  try {
    const [appointmentsResponse, clientsResponse] = await Promise.all([
      AppointmentsAPI.getAll(),
      ClientsAPI.getAll(),
    ])

    appointments.value = appointmentsResponse
    clients.value = clientsResponse
  } catch (err) {
    console.error('Failed to fetch appointments', err)
  }
}

const saveAppointment = async (form: AppointmentFormValues) => {
  try {
    const payload = toPayload(form)

    if (form.id) {
      const res = await AppointmentsAPI.update(form.id, payload)
      const idx = appointments.value.findIndex((a) => a.id === form.id)
      if (idx !== -1) appointments.value[idx] = res
    } else {
      const res = await AppointmentsAPI.create(payload)
      appointments.value.push(res)
    }

    editingAppointment.value = null
    dialog.value = false
  } catch (err) {
    console.error('Failed to save appointment', err)
  }
}

const deleteAppointment = async (id: string) => {
  try {
    await AppointmentsAPI.remove(id)
    appointments.value = appointments.value.filter((a) => a.id !== id)
  } catch (err) {
    console.error('Failed to delete appointment', err)
  }
}

const openCreate = () => {
  editingAppointment.value = createEmptyForm()
  dialog.value = true
}

const openEdit = (item: Appointment) => {
  editingAppointment.value = toFormValues(item)
  dialog.value = true
}

onMounted(fetchData)
</script>
