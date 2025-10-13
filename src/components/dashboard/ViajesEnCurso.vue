<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <MapPin class="w-4 h-4 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Viajes en Curso</h3>
        </div>
        <p class="text-sm text-gray-600 ml-10">Itinerarios activos actualmente</p>
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
              <Calendar class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">{{ formatDate(viaje.fechaInicio) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">
                {{ calcularDiasRestantes(viaje.fechaFin) }} días restantes
              </span>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="mt-2">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{{ viaje.progreso }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: viaje.progreso + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="ml-4">
          <span
            class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            :class="getEstadoClass(viaje.estado)"
          >
            {{ viaje.estado }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Clock, MapPin } from 'lucide-vue-next'

// Interfaces
interface ViajeEnCurso {
  id: number
  nombre: string
  destino: string
  fechaInicio: string
  fechaFin: string
  progreso: number
  estado: 'En Curso' | 'Por Iniciar' | 'Finalizando'
  cliente: string
  presupuesto: number
}

// Estado reactivo
const viajes = ref<ViajeEnCurso[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Props y emits
defineProps<{
  maxItems?: number
}>()

// const emit = defineEmits<{
//   verTodos: []
//   verDetalle: [viaje: ViajeEnCurso]
// }>()

// Datos mock - luego se conectará a Supabase
const fetchViajesEnCurso = async () => {
  loading.value = true
  error.value = null

  try {
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    viajes.value = [
      {
        id: 1,
        nombre: 'Europa Express',
        destino: 'París, Francia',
        fechaInicio: '2025-01-15',
        fechaFin: '2025-01-25',
        progreso: 65,
        estado: 'En Curso',
        cliente: 'María González',
        presupuesto: 3500,
      },
      {
        id: 2,
        nombre: 'Aventura Andina',
        destino: 'Cusco, Perú',
        fechaInicio: '2025-01-18',
        fechaFin: '2025-01-28',
        progreso: 30,
        estado: 'En Curso',
        cliente: 'Carlos Rodríguez',
        presupuesto: 2200,
      },
      {
        id: 3,
        nombre: 'Caribe Premium',
        destino: 'Cancún, México',
        fechaInicio: '2025-01-20',
        fechaFin: '2025-01-27',
        progreso: 80,
        estado: 'Finalizando',
        cliente: 'Ana López',
        presupuesto: 4200,
      },
    ]
  } catch (err) {
    error.value = 'Error al cargar los viajes en curso'
    console.error('Error fetching viajes en curso:', err)
  } finally {
    loading.value = false
  }
}

// Funciones auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}

const calcularDiasRestantes = (fechaFin: string) => {
  const hoy = new Date()
  const fin = new Date(fechaFin)
  const diffTime = fin.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const getEstadoClass = (estado: string) => {
  switch (estado) {
    case 'En Curso':
      return 'bg-orange-100 text-orange-800'
    case 'Por Iniciar':
      return 'bg-gray-100 text-gray-700'
    case 'Finalizando':
      return 'bg-gray-200 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Inicializar
onMounted(() => {
  fetchViajesEnCurso()
})
</script>
