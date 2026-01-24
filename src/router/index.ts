import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// ленивые импорты страниц
const AppointmentsPage = () => import('@/features/appointments/views/AppointmentsPage.vue')

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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
