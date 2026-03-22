<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 font-weight-bold">{{ t('appointments.pageTitle') }}</h2>
      <v-btn color="primary" @click="openCreate">{{ t('appointments.add') }}</v-btn>
    </div>

    <appointments-filters
      v-model:search="filters.search"
      v-model:client-id="filters.clientId"
      v-model:status="filters.status"
      v-model:year="filters.year"
      v-model:month="filters.month"
      v-model:week="filters.week"
      v-model:date="filters.date"
      :client-options="clientFilterOptions"
      :status-options="filterStatusOptions"
      :year-options="yearOptions"
      :month-options="monthOptions"
      :week-options="weekOptions"
      @reset="resetFilters"
    />

    <appointments-calendar
      v-model:client-search="clientSearch"
      :appointments="filteredAppointments"
      :clients="clients"
      :week-start="displayWeekStart"
      :selected-date="filters.date"
      @edit="openEdit"
      @delete="deleteAppointment"
      @previous-week="shiftWeek(-1)"
      @next-week="shiftWeek(1)"
      @today="goToToday"
      @schedule-client="scheduleClientAtSlot"
      @move-appointment="moveAppointmentToSlot"
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
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import type { Client } from '@/features/clients/types'
import { ClientsAPI } from '@/features/clients/service'
import type {
  Appointment,
  AppointmentFiltersQuery,
  AppointmentFormValues,
  AppointmentPayload,
  CalendarDropPayload,
  CalendarMovePayload,
} from '../types'
import AppointmentsCalendar from '../components/AppointmentsCalendar.vue'
import AppointmentsForm from '../components/AppointmentsForm.vue'
import AppointmentsFilters from '../components/AppointmentsFilters.vue'
import { AppointmentsAPI } from '../service'
import {
  defaultAppointmentStatus,
  getAppointmentStatusOptions,
  type AppointmentStatus,
} from '../status'

const { t } = useI18n()

const dialog = ref(false)
const editingAppointment = ref<AppointmentFormValues | null>(null)
const appointments = ref<Appointment[]>([])
const clients = ref<Client[]>([])
const clientSearch = ref('')
const currentWeekStart = ref(getWeekStart(dayjs().format('YYYY-MM-DD')))

const filters = ref({
  search: '',
  clientId: null as string | null,
  status: null as AppointmentStatus | null,
  year: null as number | null,
  month: null as number | null,
  week: null as number | null,
  date: '',
})

const statusOptions = computed(() => getAppointmentStatusOptions(t).map(({ title, value }) => ({ title, value })))
const filterStatusOptions = computed(() => getAppointmentStatusOptions(t).map(({ title, value }) => ({ title, value })))

const yearOptions = Array.from({ length: 11 }, (_, index) => {
  const year = dayjs().year() - 5 + index

  return {
    title: String(year),
    value: year,
  }
}).reverse()

const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, index) => ({
    title: dayjs().month(index).format('MMMM'),
    value: index + 1,
  })),
)

const weekOptions = computed(() =>
  Array.from({ length: 53 }, (_, index) => ({
    title: t('appointments.filters.weekOption', { week: index + 1 }),
    value: index + 1,
  })),
)

const clientFilterOptions = computed(() => {
  return [...clients.value]
    .filter((client) => Boolean(client.id))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((client) => ({
      title: client.name,
      value: client.id as string,
    }))
})

const createEmptyForm = (): AppointmentFormValues => ({
  clientId: '',
  title: '',
  description: '',
  date: dayjs().format('YYYY-MM-DD'),
  time: getNearestSlotTime(),
  status: defaultAppointmentStatus,
})

function getWeekStart(dateValue: string) {
  const date = dayjs(dateValue)
  const dayIndex = date.day()
  const diffToMonday = dayIndex === 0 ? -6 : 1 - dayIndex

  return date.add(diffToMonday, 'day').format('YYYY-MM-DD')
}

function getWeekStartFromYearWeek(year: number, week: number) {
  const januaryFourth = new Date(year, 0, 4)
  const day = januaryFourth.getDay() || 7
  const mondayOfFirstWeek = new Date(januaryFourth)
  mondayOfFirstWeek.setDate(januaryFourth.getDate() - day + 1)

  const weekStart = new Date(mondayOfFirstWeek)
  weekStart.setDate(mondayOfFirstWeek.getDate() + (week - 1) * 7)

  return dayjs(weekStart).format('YYYY-MM-DD')
}

function getYearWeek(dateValue: string) {
  const current = new Date(dateValue)
  const target = new Date(current.valueOf())
  const dayNumber = (current.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNumber + 3)

  const firstThursday = new Date(target.getFullYear(), 0, 4)
  const diff = target.valueOf() - firstThursday.valueOf()
  const week = 1 + Math.round(diff / 604800000)

  return {
    year: target.getFullYear(),
    week,
  }
}

function getNearestSlotTime() {
  const now = dayjs()
  const roundedMinutes = now.minute() < 30 ? 30 : 0
  const adjustedHour = now.minute() < 30 ? now.hour() : now.hour() + 1
  const normalizedHour = Math.min(Math.max(adjustedHour, 8), 19)

  return dayjs().hour(normalizedHour).minute(roundedMinutes).format('HH:mm')
}

const toFormValues = (appointment: Appointment): AppointmentFormValues => ({
  id: appointment.id,
  clientId: appointment.client.id || '',
  title: appointment.title,
  description: appointment.description || '',
  date: dayjs(appointment.date).format('YYYY-MM-DD'),
  time: dayjs(appointment.date).format('HH:mm'),
  status: appointment.status,
})

const toPayload = (form: AppointmentFormValues): AppointmentPayload => ({
  clientId: form.clientId,
  title: form.title.trim() || undefined,
  description: form.description.trim() || undefined,
  date: `${form.date}T${form.time}:00`,
  status: form.status,
})

const displayWeekStart = computed(() => {
  if (filters.value.date) {
    return getWeekStart(filters.value.date)
  }

  if (filters.value.week) {
    return getWeekStartFromYearWeek(filters.value.year ?? dayjs().year(), filters.value.week)
  }

  return currentWeekStart.value
})

const filteredAppointments = computed(() => {
  return [...appointments.value].sort(
    (left, right) => dayjs(left.date).valueOf() - dayjs(right.date).valueOf(),
  )
})

const buildFiltersQuery = (): AppointmentFiltersQuery => {
  const query: AppointmentFiltersQuery = {}

  if (filters.value.search.trim()) query.search = filters.value.search.trim()
  if (filters.value.clientId) query.clientId = filters.value.clientId
  if (filters.value.status) query.status = filters.value.status
  if (filters.value.year) query.year = filters.value.year
  if (filters.value.month) query.month = filters.value.month
  if (filters.value.week) query.week = filters.value.week
  if (filters.value.date) query.date = filters.value.date

  return query
}

const upsertAppointment = (appointment: Appointment) => {
  const existingIndex = appointments.value.findIndex((item) => item.id === appointment.id)

  if (existingIndex === -1) {
    appointments.value.push(appointment)
  } else {
    appointments.value.splice(existingIndex, 1, appointment)
  }

  appointments.value.sort((left, right) => dayjs(left.date).valueOf() - dayjs(right.date).valueOf())
}

const fetchAppointments = async () => {
  try {
    appointments.value = await AppointmentsAPI.getAll(buildFiltersQuery())
  } catch (err) {
    console.error('Failed to fetch appointments', err)
  }
}

const fetchClients = async () => {
  try {
    clients.value = await ClientsAPI.getAll()
  } catch (err) {
    console.error('Failed to fetch clients', err)
  }
}

const saveAppointment = async (form: AppointmentFormValues) => {
  try {
    const payload = toPayload(form)

    if (form.id) {
      const res = await AppointmentsAPI.update(form.id, payload)
      upsertAppointment(res)
    } else {
      const res = await AppointmentsAPI.create(payload)
      upsertAppointment(res)
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
    appointments.value = appointments.value.filter((appointment) => appointment.id !== id)
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

const shiftWeek = (direction: number) => {
  const nextWeekStart = dayjs(displayWeekStart.value).add(direction, 'week').format('YYYY-MM-DD')

  if (filters.value.date) {
    filters.value.date = nextWeekStart
    return
  }

  if (filters.value.week) {
    const nextWeekData = getYearWeek(nextWeekStart)
    filters.value.year = nextWeekData.year
    filters.value.week = nextWeekData.week
    return
  }

  currentWeekStart.value = nextWeekStart
}

const goToToday = () => {
  const today = dayjs().format('YYYY-MM-DD')

  if (filters.value.date) {
    filters.value.date = today
    return
  }

  if (filters.value.week) {
    const currentWeekData = getYearWeek(today)
    filters.value.year = currentWeekData.year
    filters.value.week = currentWeekData.week
    return
  }

  currentWeekStart.value = getWeekStart(today)
}

const resetFilters = () => {
  filters.value = {
    search: '',
    clientId: null,
    status: null,
    year: null,
    month: null,
    week: null,
    date: '',
  }
  currentWeekStart.value = getWeekStart(dayjs().format('YYYY-MM-DD'))
}

const scheduleClientAtSlot = async ({ clientId, date }: CalendarDropPayload) => {
  try {
    const createdAppointment = await AppointmentsAPI.create({
      clientId,
      date,
      status: defaultAppointmentStatus,
    })

    upsertAppointment(createdAppointment)
  } catch (err) {
    console.error('Failed to create appointment from slot', err)
  }
}

const moveAppointmentToSlot = async ({ appointmentId, date }: CalendarMovePayload) => {
  const appointment = appointments.value.find((item) => item.id === appointmentId)

  if (!appointment || dayjs(appointment.date).isSame(dayjs(date), 'minute')) {
    return
  }

  try {
    const updatedAppointment = await AppointmentsAPI.update(appointmentId, {
      date,
    })

    upsertAppointment(updatedAppointment)
  } catch (err) {
    console.error('Failed to move appointment', err)
  }
}

watch(
  () => ({ ...filters.value }),
  () => {
    void fetchAppointments()
  },
)

watch(
  () => filters.value.week,
  (week) => {
    if (week && !filters.value.year) {
      filters.value.year = dayjs().year()
    }
  },
)

watch(
  () => filters.value.date,
  (date) => {
    if (date) {
      currentWeekStart.value = getWeekStart(date)
    }
  },
)

onMounted(async () => {
  await Promise.all([fetchClients(), fetchAppointments()])
})
</script>
