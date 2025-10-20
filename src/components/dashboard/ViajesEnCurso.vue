<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <MapPin class="w-4 h-4 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Viajes Activos</h3>
        </div>
        <p class="text-sm text-gray-600 ml-10">Viajes en curso y próximos a iniciar</p>
      </div>
      <button
        type="button"
        class="text-sm text-orange-600 hover:text-orange-700 font-medium"
        @click="$emit('verTodos')"
      >
        Ver todos
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 text-sm">{{ error }}</p>
      <button
        @click="fetchViajesEnCurso"
        class="mt-2 text-sm text-orange-600 hover:text-orange-700"
      >
        Reintentar
      </button>
    </div>

    <div v-else-if="viajes.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No hay viajes en curso actualmente.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="viaje in viajes"
        :key="viaje.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        @click="$emit('verDetalle', viaje)"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin class="w-4 h-4 text-orange-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 text-sm truncate">{{ viaje.nombre }}</h4>
              <p class="text-xs text-gray-600 truncate">{{ viaje.destino }}</p>
            </div>
          </div>

          <!-- Información del progreso -->
          <div class="mt-3 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-orange-600" />
              <span class="text-sm text-gray-600">{{ formatDate(viaje.fecha_inicio) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-orange-600" />
              <span class="text-sm text-gray-600">
                {{ calcularDiasRestantes(viaje.fecha_fin) }} días restantes
              </span>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="mt-2">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{{ viaje.progreso_porcentaje }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: viaje.progreso_porcentaje + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="ml-4">
          <span
            class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            :class="getEstadoClass(viaje.estado)"
          >
            {{ formatEstado(viaje.estado) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Clock, MapPin } from 'lucide-vue-next'

import { viajesService } from '@/services/viajes.service'

interface Props {
  maxItems?: number
}

interface ViajeCard {
  id: string
  nombre: string
  destino: string
  fecha_inicio: string | null
  fecha_fin: string | null
  progreso_porcentaje: number
  estado: string | null
}

const props = defineProps<Props>()

const viajes = ref<ViajeCard[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Conectado a Supabase
const fetchViajesEnCurso = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('🔍 Cargando viajes en curso...')

    // Primero intentar con getInProgress
    const { data, error: serviceError } = await viajesService.getInProgress()

    console.log('📊 Respuesta del servicio:', { data, serviceError })

    if (serviceError) {
      console.error('❌ Error del servicio:', serviceError)
      error.value = serviceError
      viajes.value = []
      return
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No se encontraron viajes en curso')
      viajes.value = []
      return
    }

    const ordered = (data || [])
      .sort((a, b) => (a.fecha_inicio || '').localeCompare(b.fecha_inicio || ''))
      .map((viaje) => {
        console.log('🗺️ Procesando viaje:', viaje.nombre, 'Estado:', viaje.estado)
        return {
          id: viaje.id,
          nombre: viaje.nombre,
          destino: viaje.cotizacion?.nombre || viaje.descripcion || 'Sin destino definido',
          fecha_inicio: viaje.fecha_inicio ?? null,
          fecha_fin: viaje.fecha_fin ?? null,
          progreso_porcentaje: viaje.progreso_porcentaje ?? 0,
          estado: viaje.estado ?? null,
        }
      })

    viajes.value = props.maxItems ? ordered.slice(0, props.maxItems) : ordered
    console.log('✅ Viajes cargados:', viajes.value.length)
  } catch (err) {
    error.value = 'Error al cargar los viajes en curso'
    console.error('❌ Error fetching viajes en curso:', err)
  } finally {
    loading.value = false
  }
}

// Funciones auxiliares
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Sin fecha'

  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}

const calcularDiasRestantes = (fechaFin: string | null | undefined) => {
  if (!fechaFin) return 0
  const hoy = new Date()
  const fin = new Date(fechaFin)
  const diffTime = fin.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const getEstadoClass = (estado?: string | null) => {
  switch (estado) {
    case 'en_curso':
      return 'bg-orange-100 text-orange-800'
    case 'por_iniciar':
      return 'bg-amber-100 text-amber-700'
    case 'finalizado':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatEstado = (estado?: string | null) => {
  switch (estado) {
    case 'en_curso':
      return 'En curso'
    case 'por_iniciar':
      return 'Por iniciar'
    case 'finalizado':
      return 'Finalizado'
    default:
      return 'Sin estado'
  }
}

// Inicializar
onMounted(() => {
  fetchViajesEnCurso()
})
</script>
