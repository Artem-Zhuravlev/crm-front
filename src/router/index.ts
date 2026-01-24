import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const AppointmentsPage = () => import('@/features/appointments/views/AppointmentsPage.vue')
const ClientsPage = () => import('@/features/clients/views/ClientsPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/appointments',
  },
  {
    path: '/appointments',
    name: 'appointments',
    component: AppointmentsPage,
  },
  {
    path: '/clients',
    name: 'clients',
    component: ClientsPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
