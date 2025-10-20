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
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
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
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
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
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
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
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
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
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
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
        class="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer"
      >
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
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
import { reactive, onMounted } from 'vue'
import {
  Users,
  CheckCircle,
  TrendingUp,
  FileText,
  FileCheck,
  Cake,
  BarChart3,
} from 'lucide-vue-next'
import { supabase } from '@/services/supabase'

// Stats data - conectado a Supabase
const stats = reactive({
  totalClients: 0,
  activeTrips: 0,
  todayQueries: 0,
  expiringPassports: 0,
  expiringVisas: 0,
  todayBirthdays: 0,
})

// Cargar estadísticas al montar
onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  try {
    // 1. Total de clientes
    const { count: clientsCount } = await supabase
      .from('viajeroz')
      .select('*', { count: 'exact', head: true })
    stats.totalClients = clientsCount || 0

    // 2. Viajes activos (en curso)
    const { count: activeTripsCount } = await supabase
      .from('viajes')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'en_curso')
    stats.activeTrips = activeTripsCount || 0

    // 3. Pasaportes por vencer (próximos 90 días)
    const hoy = new Date()
    const en90Dias = new Date()
    en90Dias.setDate(hoy.getDate() + 90)

    const { count: passportsCount } = await supabase
      .from('viajeroz')
      .select('id', { count: 'exact', head: true })
      .not('numero_pasaporte', 'is', null)
      .not('fecha_vencimiento_pasaporte', 'is', null)
      .gte('fecha_vencimiento_pasaporte', hoy.toISOString().split('T')[0])
      .lte('fecha_vencimiento_pasaporte', en90Dias.toISOString().split('T')[0])
    stats.expiringPassports = passportsCount || 0

    // 4. Visas por vencer (próximos 90 días)
    const { count: visasCount } = await supabase
      .from('viajeroz')
      .select('id', { count: 'exact', head: true })
      .not('numero_visa', 'is', null)
      .not('fecha_vencimiento_visa', 'is', null)
      .gte('fecha_vencimiento_visa', hoy.toISOString().split('T')[0])
      .lte('fecha_vencimiento_visa', en90Dias.toISOString().split('T')[0])
    stats.expiringVisas = visasCount || 0

    // 5. Cumpleaños hoy
    const mesActual = hoy.getMonth() + 1
    const diaActual = hoy.getDate()

    const { data: birthdaysData } = await supabase
      .from('viajeroz')
      .select('fecha_nacimiento')
      .not('fecha_nacimiento', 'is', null)

    if (birthdaysData) {
      const cumpleanosHoy = birthdaysData.filter((viajero) => {
        if (!viajero.fecha_nacimiento) return false
        const fecha = new Date(viajero.fecha_nacimiento)
        return fecha.getMonth() + 1 === mesActual && fecha.getDate() === diaActual
      })
      stats.todayBirthdays = cumpleanosHoy.length
    }

    // 6. Consultas hoy (cotizaciones creadas hoy)
    const hoyInicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString()
    const hoyFin = new Date(hoy.setHours(23, 59, 59, 999)).toISOString()

    const { count: queriesCount } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', hoyInicio)
      .lte('created_at', hoyFin)
    stats.todayQueries = queriesCount || 0
  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
  }
}
</script>
