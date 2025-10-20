import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ClientView from '../views/ClientView.vue'
import DashboardView from '../views/DashboardView.vue'
import ViajesView from '../views/ViajesView.vue'
import ViajeDetailView from '../views/ViajeDetailView.vue'
import CotizacionesView from '../views/CotizacionesView.vue'
import ClientViajesView from '../views/ClientViajesView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, redirectIfAuthenticated: true },
    },
    {
      path: '/cliente',
      name: 'client',
      component: ClientView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/viajes',
      name: 'viajes',
      component: ViajesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/viajes/:id',
      name: 'viaje-detail',
      component: ViajeDetailView,
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: '/cotizaciones',
      name: 'cotizaciones',
      component: CotizacionesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/cliente/viajes',
      name: 'client-viajes',
      component: ClientViajesView,
      meta: { requiresAuth: true },
    },
  ],
})

// Guardia de navegación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Esperar a que se inicialice la autenticación
  if (authStore.initializing) {
    await new Promise((resolve) => {
      const unwatch = () => {
        if (!authStore.initializing) {
          resolve(void 0)
        } else {
          setTimeout(unwatch, 50)
        }
      }
      unwatch()
    })
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const redirectIfAuthenticated = to.meta.redirectIfAuthenticated === true
  const isAuthenticated = authStore.isAuthenticated

  // Si la ruta requiere autenticación y no está autenticado
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Si la ruta redirige si está autenticado y está autenticado
  if (redirectIfAuthenticated && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
