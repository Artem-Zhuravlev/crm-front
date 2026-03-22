<template>
  <section class="appointments-board">
    <div class="appointments-sidebar">
      <div class="sidebar-headline">
        <div>
          <p class="eyebrow">{{ t('appointments.queue') }}</p>
          <h3>{{ t('common.clients') }}</h3>
        </div>
        <v-chip size="small" color="primary" variant="tonal">{{ visibleClients.length }}</v-chip>
      </div>

      <v-text-field
        :model-value="clientSearch"
        :label="t('appointments.searchClient')"
        density="compact"
        variant="outlined"
        hide-details
        prepend-inner-icon="mdi-magnify"
        @update:model-value="emit('update:clientSearch', $event ?? '')"
      />

      <div class="clients-stack">
        <button
          v-for="client in visibleClients"
          :key="client.id"
          class="client-drag-card"
          draggable="true"
          type="button"
          @dragstart="startClientDrag(client, $event)"
        >
          <span class="client-name">{{ client.name }}</span>
          <span class="client-meta">{{ t('appointments.loadCount', { count: getClientLoad(client.id) }) }}</span>
        </button>

        <div v-if="!visibleClients.length" class="empty-sidebar-state">
          {{ t('appointments.noClients') }}
        </div>
      </div>
    </div>

    <div class="calendar-shell">
      <div class="calendar-toolbar">
        <div>
          <p class="eyebrow">{{ t('appointments.planner') }}</p>
          <h3>{{ weekLabel }}</h3>
        </div>

        <div class="toolbar-actions">
            <v-btn size="small" density="comfortable" variant="text" prepend-icon="mdi-chevron-left" @click="emit('previous-week')">
            {{ t('common.back') }}
          </v-btn>
            <v-btn size="small" density="comfortable" variant="tonal" color="primary" @click="emit('today')">{{ t('common.today') }}</v-btn>
            <v-btn size="small" density="comfortable" variant="text" append-icon="mdi-chevron-right" @click="emit('next-week')">
            {{ t('common.forward') }}
          </v-btn>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="grid-corner">{{ t('appointments.time') }}</div>

        <div
          v-for="day in weekDays"
          :key="day.dateKey"
          class="day-header"
          :class="{ 'day-header--today': day.isToday, 'day-header--selected': day.isSelected }"
        >
          <span class="day-header__weekday">{{ day.weekday }}</span>
          <span class="day-header__date">{{ day.label }}</span>
        </div>

        <template v-for="slot in timeSlots" :key="slot.value">
          <div class="time-cell">
            <span>{{ slot.value }}</span>
          </div>

          <div
            v-for="day in weekDays"
            :key="`${day.dateKey}-${slot.value}`"
            class="slot-cell"
            :class="{ 'slot-cell--active': activeDropSlot === `${day.dateKey}-${slot.value}` }"
            @dragover.prevent="setActiveDropSlot(day.dateKey, slot.value)"
            @dragenter.prevent="setActiveDropSlot(day.dateKey, slot.value)"
            @dragleave="clearActiveDropSlot(day.dateKey, slot.value)"
            @drop.prevent="handleSlotDrop(day.dateKey, slot.value, $event)"
          >
            <div class="slot-cell__surface">
              <button
                v-for="appointment in getAppointmentsForSlot(day.dateKey, slot.value)"
                :key="appointment.id"
                class="appointment-card"
                :class="{
                  'appointment-card--completed': appointment.status === 'completed',
                  'appointment-card--warning': isAttentionStatus(appointment.status),
                  'appointment-card--dragging': draggedAppointmentId === appointment.id,
                }"
                draggable="true"
                type="button"
                @click="emit('edit', appointment)"
                @dragstart="startAppointmentDrag(appointment, $event)"
                @dragend="resetDragState"
              >
                <span class="appointment-card__time">{{ formatTime(appointment.date) }}</span>
                <strong class="appointment-card__title">{{ appointment.title }}</strong>
                <span class="appointment-card__client">{{ appointment.client?.name || t('appointments.unnamedClient') }}</span>
                <span v-if="appointment.description" class="appointment-card__description">
                  {{ appointment.description }}
                </span>

                <span class="appointment-card__actions">
                  <v-chip size="x-small" :color="statusColor(appointment.status)" variant="flat">
                    {{ compactStatusLabel(appointment.status) }}
                  </v-chip>
                  <v-btn
                    icon="mdi-delete"
                    size="x-small"
                    density="compact"
                    variant="text"
                    color="error"
                    @click.stop="emit('delete', appointment.id)"
                  />
                </span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import type { Client } from '@/features/clients/types'
import type {
  Appointment,
  CalendarDropPayload,
  CalendarMovePayload,
} from '../types'
import {
  appointmentStatusColorMap,
  getAppointmentStatusLabel,
  type AppointmentStatus,
} from '../status'

const { t } = useI18n()

type DragPayload =
  | {
      type: 'client'
      clientId: string
    }
  | {
      type: 'appointment'
      appointmentId: string
    }

const props = defineProps<{
  appointments: Appointment[]
  clients: Client[]
  weekStart: string
  selectedDate: string
  clientSearch: string
}>()

const emit = defineEmits<{
  (event: 'update:clientSearch', value: string): void
  (event: 'previous-week'): void
  (event: 'next-week'): void
  (event: 'today'): void
  (event: 'edit', value: Appointment): void
  (event: 'delete', value: string): void
  (event: 'schedule-client', value: CalendarDropPayload): void
  (event: 'move-appointment', value: CalendarMovePayload): void
}>()

const activeDropSlot = ref<string | null>(null)
const draggedAppointmentId = ref<string | null>(null)

const timeSlots = computed(() => {
  const slots: Array<{ value: string }> = []

  for (let hour = 8; hour < 20; hour += 1) {
    for (const minute of [0, 30]) {
      slots.push({
        value: dayjs().hour(hour).minute(minute).format('HH:mm'),
      })
    }
  }

  return slots
})

const weekDays = computed(() => {
  const start = dayjs(props.weekStart)

  return Array.from({ length: 7 }, (_, index) => {
    const currentDay = start.add(index, 'day')

    return {
      dateKey: currentDay.format('YYYY-MM-DD'),
      weekday: currentDay.format('ddd').toUpperCase(),
      label: currentDay.format('DD MMM'),
      isToday: currentDay.isSame(dayjs(), 'day'),
      isSelected: props.selectedDate ? currentDay.isSame(dayjs(props.selectedDate), 'day') : false,
    }
  })
})

const weekLabel = computed(() => {
  const start = dayjs(props.weekStart)
  const end = start.add(6, 'day')

  return `${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}`
})

const visibleClients = computed(() => {
  const search = props.clientSearch.trim().toLowerCase()

  return [...props.clients]
    .sort((left, right) => left.name.localeCompare(right.name))
    .filter((client) => !search || client.name.toLowerCase().includes(search))
})

const appointmentsBySlot = computed(() => {
  const slotMap = new Map<string, Appointment[]>()

  for (const appointment of props.appointments) {
    const date = dayjs(appointment.date)
    const slotKey = `${date.format('YYYY-MM-DD')}-${date.format('HH:mm')}`
    const existingItems = slotMap.get(slotKey) ?? []

    existingItems.push(appointment)
    existingItems.sort((left, right) => left.title.localeCompare(right.title))
    slotMap.set(slotKey, existingItems)
  }

  return slotMap
})

const encodeDragPayload = (payload: DragPayload) => JSON.stringify(payload)

const decodeDragPayload = (event: DragEvent): DragPayload | null => {
  const rawPayload = event.dataTransfer?.getData('application/json')

  if (!rawPayload) {
    return null
  }

  try {
    return JSON.parse(rawPayload) as DragPayload
  } catch {
    return null
  }
}

const formatTime = (value: string) => dayjs(value).format('HH:mm')
const statusColor = (status: AppointmentStatus) => appointmentStatusColorMap[status]
const compactStatusLabel = (status: AppointmentStatus) => getAppointmentStatusLabel(t, status)
const isAttentionStatus = (status: AppointmentStatus) => status === 'no_show' || status === 'unreachable'

const getAppointmentsForSlot = (dateKey: string, time: string) => {
  return appointmentsBySlot.value.get(`${dateKey}-${time}`) ?? []
}

const getClientLoad = (clientId?: string) => {
  if (!clientId) {
    return 0
  }

  return props.appointments.filter((appointment) => appointment.client?.id === clientId).length
}

const setActiveDropSlot = (dateKey: string, time: string) => {
  activeDropSlot.value = `${dateKey}-${time}`
}

const clearActiveDropSlot = (dateKey: string, time: string) => {
  const slotKey = `${dateKey}-${time}`

  if (activeDropSlot.value === slotKey) {
    activeDropSlot.value = null
  }
}

const resetDragState = () => {
  activeDropSlot.value = null
  draggedAppointmentId.value = null
}

const startClientDrag = (client: Client, event: DragEvent) => {
  if (!client.id || !event.dataTransfer) {
    return
  }

  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData(
    'application/json',
    encodeDragPayload({
      type: 'client',
      clientId: client.id,
    }),
  )
}

const startAppointmentDrag = (appointment: Appointment, event: DragEvent) => {
  if (!event.dataTransfer) {
    return
  }

  draggedAppointmentId.value = appointment.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData(
    'application/json',
    encodeDragPayload({
      type: 'appointment',
      appointmentId: appointment.id,
    }),
  )
}

const handleSlotDrop = (dateKey: string, time: string, event: DragEvent) => {
  const payload = decodeDragPayload(event)
  resetDragState()

  if (!payload) {
    return
  }

  const date = `${dateKey}T${time}:00`

  if (payload.type === 'client') {
    emit('schedule-client', {
      clientId: payload.clientId,
      date,
    })
    return
  }

  emit('move-appointment', {
    appointmentId: payload.appointmentId,
    date,
  })
}
</script>

<style scoped>
.appointments-board {
  display: grid;
  gap: 16px;
  grid-template-columns: 220px minmax(0, 1fr);
}

.appointments-sidebar,
.calendar-shell {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background:
    radial-gradient(circle at top, rgba(248, 250, 252, 0.9), rgba(255, 255, 255, 0.96)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.appointments-sidebar {
  padding: 12px;
  position: sticky;
  top: 88px;
  height: fit-content;
}

.sidebar-headline,
.calendar-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.eyebrow {
  margin: 0 0 2px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #64748b;
}

.sidebar-headline h3,
.calendar-toolbar h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.1;
  color: #0f172a;
}

.clients-stack {
  display: grid;
  gap: 8px;
  margin-top: 10px;
  max-height: calc(100vh - 180px);
  overflow: auto;
  padding-right: 2px;
}

.client-drag-card {
  width: 100%;
  border: 0;
  border-radius: 14px;
  padding: 10px 12px;
  text-align: left;
  cursor: grab;
  background: linear-gradient(135deg, #0f766e, #155e75);
  color: #f8fafc;
  box-shadow: 0 8px 18px rgba(15, 118, 110, 0.18);
}

.client-drag-card:active {
  cursor: grabbing;
}

.client-name,
.client-meta {
  display: block;
}

.client-name {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
}

.client-meta {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(248, 250, 252, 0.72);
}

.empty-sidebar-state {
  padding: 18px 12px;
  border-radius: 14px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  background: rgba(226, 232, 240, 0.55);
}

.calendar-shell {
  overflow: hidden;
}

.calendar-toolbar {
  padding: 12px 12px 0;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 56px repeat(7, minmax(136px, 1fr));
  overflow: auto;
  padding: 12px;
}

.grid-corner,
.day-header,
.time-cell,
.slot-cell {
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.grid-corner,
.day-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
}

.grid-corner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.day-header {
  min-height: 52px;
  padding: 8px 10px;
  border-left: 1px solid rgba(148, 163, 184, 0.12);
}

.day-header--today {
  background: linear-gradient(180deg, rgba(13, 148, 136, 0.12), rgba(255, 255, 255, 0.96));
}

.day-header--selected {
  box-shadow: inset 0 -3px 0 #0f766e;
}

.day-header__weekday,
.day-header__date {
  display: block;
}

.day-header__weekday {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.day-header__date {
  margin-top: 2px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.time-cell {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  min-height: 76px;
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  background: rgba(248, 250, 252, 0.9);
}

.slot-cell {
  min-height: 76px;
  padding: 4px;
  border-left: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.75);
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.slot-cell--active {
  background: rgba(13, 148, 136, 0.12);
  box-shadow: inset 0 0 0 2px rgba(13, 148, 136, 0.3);
}

.slot-cell__surface {
  display: grid;
  gap: 4px;
}

.appointment-card {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 8px;
  text-align: left;
  cursor: pointer;
  background: linear-gradient(160deg, #0f172a, #1e293b);
  color: #f8fafc;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.16);
}

.appointment-card--completed {
  background: linear-gradient(160deg, #166534, #14532d);
}

.appointment-card--warning {
  background: linear-gradient(160deg, #9a3412, #7c2d12);
}

.appointment-card--dragging {
  opacity: 0.5;
}

.appointment-card__time,
.appointment-card__client,
.appointment-card__description,
.appointment-card__actions {
  display: block;
}

.appointment-card__time {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.72);
}

.appointment-card__title {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.appointment-card__client {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.2;
  color: rgba(241, 245, 249, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-card__description {
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.3;
  color: rgba(226, 232, 240, 0.72);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.appointment-card__actions {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

@media (max-width: 1200px) {
  .appointments-board {
    grid-template-columns: 1fr;
  }

  .appointments-sidebar {
    position: static;
  }

  .clients-stack {
    max-height: none;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 720px) {
  .calendar-toolbar {
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: stretch;
  }

  .toolbar-actions :deep(.v-btn) {
    flex: 1 1 0;
  }

  .calendar-grid {
    grid-template-columns: 56px repeat(7, minmax(126px, 1fr));
    padding: 10px;
  }
}
</style>
