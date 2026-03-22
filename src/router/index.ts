import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const AppointmentsPage = () => import('@/features/appointments/views/AppointmentsPage.vue')
const ClientsPage = () => import('@/features/clients/views/ClientsPage.vue')
const PaymentsPage = () => import('@/features/payments/views/PaymentsPage.vue')
const StatsPage = () => import('@/features/stats/views/StatsPage.vue')
const HistoryPage = () => import('@/features/history/views/HistoryPage.vue')
const LoginPage = () => import('@/features/auth/views/LoginPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { public: true, hideLayout: true },
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
  {
    path: '/payments',
    name: 'payments',
    component: PaymentsPage,
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsPage,
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    if (to.path === '/login' && authStore.isAuthenticated()) {
      return '/appointments'
    }

    return true
  }

  if (!authStore.isAuthenticated()) {
    return '/login'
  }

  try {
    if (!authStore.user) {
      await authStore.fetchCurrentUser()
    }
  } catch {
    return '/login'
  }

  return true
})

export default router
