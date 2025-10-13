import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ClientView from '../views/ClientView.vue'
import DashboardView from '../views/DashboardView.vue'
import ViajesView from '../views/ViajesView.vue'
import CotizacionesView from '../views/CotizacionesView.vue'
import ClientViajesView from '../views/ClientViajesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/cliente',
      name: 'client',
      component: ClientView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/viajes',
      name: 'viajes',
      component: ViajesView,
    },
    {
      path: '/cotizaciones',
      name: 'cotizaciones',
      component: CotizacionesView,
    },
    {
      path: '/cliente/viajes',
      name: 'client-viajes',
      component: ClientViajesView,
    },
  ],
})

export default router
