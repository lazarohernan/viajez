<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileCheck class="w-4 h-4 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Visas por Vencer</h3>
        </div>
        <p class="text-sm text-gray-600 ml-10">Permisos de viaje que expiran pronto</p>
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
        @click="fetchVisasPorVencer"
        class="mt-2 text-sm text-orange-600 hover:text-orange-700"
      >
        Reintentar
      </button>
    </div>

    <div v-else-if="visas.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No hay visas por vencer en los próximos 30 días.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="visa in visas"
        :key="visa.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        @click="$emit('verDetalle', visa)"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileCheck class="w-4 h-4 text-orange-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 text-sm truncate">
                {{ visa.cliente.nombre }} {{ visa.cliente.apellido }}
              </h4>
              <p class="text-xs text-gray-600 truncate">{{ visa.pais }} - {{ visa.tipo }}</p>
            </div>
          </div>

          <!-- Información de vencimiento -->
          <div class="mt-3 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">
                Vence: {{ formatDate(visa.fechaVencimiento) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-gray-400" />
              <span class="text-sm" :class="getUrgenciaClass(visa.diasRestantes)">
                {{ visa.diasRestantes }} días restantes
              </span>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="mt-2 text-xs text-gray-500">
            <span>Número: {{ visa.numero }}</span>
            <span class="mx-2">•</span>
            <span>Emisión: {{ formatDate(visa.fechaEmision) }}</span>
          </div>
        </div>

        <div class="ml-4">
          <span
            class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            :class="getUrgenciaBadgeClass(visa.diasRestantes)"
          >
            {{ getUrgenciaText(visa.diasRestantes) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Clock, FileCheck } from 'lucide-vue-next'

// Interfaces
interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
}

interface VisaPorVencer {
  id: number
  cliente: Cliente
  pais: string
  tipo: string
  numero: string
  fechaEmision: string
  fechaVencimiento: string
  diasRestantes: number
  estado: 'Activa' | 'Por Vencer' | 'Vencida'
}

// Estado reactivo
const visas = ref<VisaPorVencer[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Props y emits
defineProps<{
  maxItems?: number
}>()

// const emit = defineEmits<{
//   verTodos: []
//   verDetalle: [visa: VisaPorVencer]
// }>()

// Datos mock - luego se conectará a Supabase
const fetchVisasPorVencer = async () => {
  loading.value = true
  error.value = null

  try {
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 800))

    visas.value = [
      {
        id: 1,
        cliente: {
          id: 1,
          nombre: 'María',
          apellido: 'González',
          email: 'maria@email.com',
        },
        pais: 'Estados Unidos',
        tipo: 'Turista B1/B2',
        numero: 'V123456789',
        fechaEmision: '2024-06-15',
        fechaVencimiento: '2025-01-20',
        diasRestantes: 15,
        estado: 'Por Vencer',
      },
      {
        id: 2,
        cliente: {
          id: 2,
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          email: 'carlos@email.com',
        },
        pais: 'Canadá',
        tipo: 'Turista',
        numero: 'C987654321',
        fechaEmision: '2024-08-10',
        fechaVencimiento: '2025-01-25',
        diasRestantes: 20,
        estado: 'Por Vencer',
      },
      {
        id: 3,
        cliente: {
          id: 3,
          nombre: 'Ana',
          apellido: 'López',
          email: 'ana@email.com',
        },
        pais: 'Reino Unido',
        tipo: 'Turista',
        numero: 'UK456789123',
        fechaEmision: '2024-05-20',
        fechaVencimiento: '2025-01-18',
        diasRestantes: 13,
        estado: 'Por Vencer',
      },
      {
        id: 4,
        cliente: {
          id: 4,
          nombre: 'Luis',
          apellido: 'Martínez',
          email: 'luis@email.com',
        },
        pais: 'Australia',
        tipo: 'Turista',
        numero: 'AU789123456',
        fechaEmision: '2024-07-01',
        fechaVencimiento: '2025-01-30',
        diasRestantes: 25,
        estado: 'Por Vencer',
      },
    ]
  } catch (err) {
    error.value = 'Error al cargar las visas por vencer'
    console.error('Error fetching visas por vencer:', err)
  } finally {
    loading.value = false
  }
}

// Funciones auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getUrgenciaClass = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'text-red-600 font-medium'
  if (diasRestantes <= 15) return 'text-orange-600 font-medium'
  return 'text-gray-600'
}

const getUrgenciaBadgeClass = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'bg-red-100 text-red-800'
  if (diasRestantes <= 15) return 'bg-orange-100 text-orange-800'
  return 'bg-gray-100 text-gray-700'
}

const getUrgenciaText = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'Urgente'
  if (diasRestantes <= 15) return 'Próximo'
  return 'Monitoreo'
}

// Inicializar
onMounted(() => {
  fetchVisasPorVencer()
})
</script>
