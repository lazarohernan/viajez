<template>
  <div class="space-y-4 p-4">
    <!-- Título del componente -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <BarChart3 class="w-4 h-4 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Estadísticas Generales</h3>
      </div>
      <p class="text-sm text-gray-600 ml-10">Resumen general de métricas importantes</p>
    </div>

    <!-- Primera fila: 2 estadísticas -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Total Clientes -->
      <div
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0"
            >
              <Users class="w-5 h-5 text-white" />
            </div>
            <p class="text-sm font-medium text-orange-700">Clientes Totales</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-800">
              {{ stats.totalClients.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Viajes Activos -->
      <div
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0"
            >
              <CheckCircle class="w-5 h-5 text-white" />
            </div>
            <p class="text-sm font-medium text-orange-700">Viajes Activos</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-800">
              {{ stats.activeTrips }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Segunda fila: 2 estadísticas - Documentos -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Pasaportes por Vencer -->
      <div
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0"
            >
              <FileText class="w-5 h-5 text-white" />
            </div>
            <p class="text-sm font-medium text-orange-700">Pasaportes por Vencer</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-800">
              {{ stats.expiringPassports }}
            </p>
          </div>
        </div>
      </div>

      <!-- Visas por Vencer -->
      <div
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0"
            >
              <FileCheck class="w-5 h-5 text-white" />
            </div>
            <p class="text-sm font-medium text-orange-700">Visas por Vencer</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-800">
              {{ stats.expiringVisas }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tercera fila: 2 estadísticas - Actividad diaria -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Cumpleaños Hoy -->
      <div
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0"
            >
              <Cake class="w-5 h-5 text-white" />
            </div>
            <p class="text-sm font-medium text-orange-700">Cumpleaños Hoy</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-800">
              {{ stats.todayBirthdays }}
            </p>
          </div>
        </div>
      </div>

      <!-- Consultas Hoy -->
      <div
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0"
            >
              <TrendingUp class="w-5 h-5 text-white" />
            </div>
            <p class="text-sm font-medium text-orange-700">Consultas Hoy</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-800">
              {{ stats.todayQueries }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
  Users,
  CheckCircle,
  TrendingUp,
  FileText,
  FileCheck,
  Cake,
  BarChart3,
} from 'lucide-vue-next'

// Mock stats data - luego se conectará a Supabase
const stats = reactive({
  totalClients: 1247,
  activeTrips: 89,
  todayQueries: 23,
  expiringPassports: 12,
  expiringVisas: 8,
  todayBirthdays: 3,
})

// Props para permitir personalización desde el padre
defineProps<{
  totalClients?: number
  activeTrips?: number
  todayQueries?: number
  expiringPassports?: number
  expiringVisas?: number
  todayBirthdays?: number
}>()

// Emits para actualizar datos desde el padre si es necesario
// const emit = defineEmits<{
//   updateStats: []
// }>()
</script>
