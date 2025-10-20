<template>
  <!-- Sidebar flotante con expansión al hover -->
  <aside class="hidden md:block fixed left-4 top-4 bottom-4 z-40 group" aria-label="Barra lateral">
    <div
      class="h-full w-16 group-hover:w-64 transition-all duration-300 ease-out bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg rounded-2xl overflow-hidden flex flex-col"
    >
      <div class="h-16 flex items-center px-3 border-b border-gray-200">
        <div class="w-9 h-9 flex-shrink-0 flex items-center justify-center">
          <Plane class="w-5 h-5 text-orange-500" />
        </div>
      </div>

      <nav class="flex-1 py-3 overflow-y-auto">
        <ul class="space-y-1 px-2 pr-3">
          <li>
            <RouterLink
              to="/dashboard"
              class="flex items-center justify-center group-hover:justify-start px-0 group-hover:px-2 py-2 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200 gap-0 group-hover:gap-3"
              :class="activeClass('/dashboard')"
            >
              <LayoutDashboard class="w-5 h-5 flex-shrink-0" />
              <span
                class="ml-0 group-hover:ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 overflow-hidden w-0 max-w-0 group-hover:w-auto group-hover:max-w-[180px] transition-all duration-200"
                >Dashboard</span
              >
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/viajes"
              class="flex items-center justify-center group-hover:justify-start px-0 group-hover:px-2 py-2 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200 gap-0 group-hover:gap-3"
              :class="activeClass('/viajes')"
            >
              <MapPin class="w-5 h-5 flex-shrink-0" />
              <span
                class="ml-0 group-hover:ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 overflow-hidden w-0 max-w-0 group-hover:w-auto group-hover:max-w-[180px] transition-all duration-200"
                >Viajes</span
              >
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/cliente"
              class="flex items-center justify-center group-hover:justify-start px-0 group-hover:px-2 py-2 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200 gap-0 group-hover:gap-3"
              :class="activeClass('/cliente')"
            >
              <Users class="w-5 h-5 flex-shrink-0" />
              <span
                class="ml-0 group-hover:ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 overflow-hidden w-0 max-w-0 group-hover:w-auto group-hover:max-w-[180px] transition-all duration-200"
                >Viajeroz</span
              >
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/cotizaciones"
              class="flex items-center justify-center group-hover:justify-start px-0 group-hover:px-2 py-2 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200 gap-0 group-hover:gap-3"
              :class="activeClass('/cotizaciones')"
            >
              <File class="w-5 h-5 flex-shrink-0" />
              <span
                class="ml-0 group-hover:ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 overflow-hidden w-0 max-w-0 group-hover:w-auto group-hover:max-w-[180px] transition-all duration-200"
                >Cotizaciones</span
              >
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/perfil"
              class="flex items-center justify-center group-hover:justify-start px-0 group-hover:px-2 py-2 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200 gap-0 group-hover:gap-3"
              :class="activeClass('/perfil')"
            >
              <User class="w-5 h-5 flex-shrink-0" />
              <span
                class="ml-0 group-hover:ml-3 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 overflow-hidden w-0 max-w-0 group-hover:w-auto group-hover:max-w-[180px] transition-all duration-200"
                >Perfil</span
              >
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="p-3 border-t border-gray-200">
        <button
          type="button"
          @click="handleLogout"
          class="w-full flex items-center justify-center group-hover:justify-start px-0 group-hover:px-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200"
        >
          <LogOut class="w-5 h-5 flex-shrink-0" />
          <span
            class="ml-0 group-hover:ml-3 text-sm font-medium whitespace-nowrap overflow-hidden w-0 max-w-0 group-hover:w-auto group-hover:max-w-[180px] transition-all duration-200"
            >Salir</span
          >
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { Plane, LayoutDashboard, Users, MapPin, File, User, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isActive = (path: string) => route.path.startsWith(path)
const activeClass = (path: string) =>
  isActive(path) ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-100' : ''

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
