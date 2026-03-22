export const appointmentStatusValues = [
  'scheduled',
  'completed',
  'no_show',
  'unreachable',
  'cancelled',
] as const

export type AppointmentStatus = (typeof appointmentStatusValues)[number]

type Translate = (key: string, params?: Record<string, unknown>) => string

export const appointmentStatusColorMap: Record<AppointmentStatus, string> = {
  scheduled: 'primary',
  completed: 'success',
  no_show: 'warning',
  unreachable: 'deep-orange',
  cancelled: 'grey',
}

export const defaultAppointmentStatus: AppointmentStatus = 'scheduled'

export const getAppointmentStatusLabel = (t: Translate, status: AppointmentStatus) => {
  return t(`appointments.status.${status}`)
}

export const getAppointmentStatusOptions = (t: Translate) => {
  return appointmentStatusValues.map((value) => ({
    title: getAppointmentStatusLabel(t, value),
    value,
    color: appointmentStatusColorMap[value],
  }))
}
