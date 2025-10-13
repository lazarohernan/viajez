<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Cake class="w-4 h-4 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Cumpleaños</h3>
        </div>
        <p class="text-sm text-gray-600 ml-10">Clientes que celebran hoy</p>
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
      <button @click="fetchCumpleanos" class="mt-2 text-sm text-orange-600 hover:text-orange-700">
        Reintentar
      </button>
    </div>

    <div v-else-if="cumpleanos.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No hay cumpleaños próximos en los próximos 30 días.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="cumple in cumpleanos"
        :key="cumple.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        @click="$emit('verDetalle', cumple)"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Cake class="w-4 h-4 text-orange-600" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 text-sm truncate">
                {{ cumple.cliente.nombre }} {{ cumple.cliente.apellido }}
              </h4>
              <p class="text-xs text-gray-600">{{ calcularEdad(cumple.fechaNacimiento) }} años</p>
            </div>
          </div>

          <!-- Información del cumpleaños -->
          <div class="mt-3 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-gray-400" />
              <span class="text-sm text-gray-600">{{ formatDate(cumple.fechaNacimiento) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-gray-400" />
              <span class="text-sm" :class="getProximidadClass(cumple.diasParaCumpleanos)">
                {{ getProximidadText(cumple.diasParaCumpleanos) }}
              </span>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="mt-2 text-xs text-gray-500">
            <span>{{ cumple.cliente.email }}</span>
            <span class="mx-2">•</span>
            <span>{{ cumple.cliente.telefono || 'Sin teléfono' }}</span>
          </div>
        </div>

        <div class="ml-4">
          <span
            class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            :class="getProximidadBadgeClass(cumple.diasParaCumpleanos)"
          >
            {{ getProximidadBadgeText(cumple.diasParaCumpleanos) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Clock, Cake } from 'lucide-vue-next'

// Interfaces
interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
}

interface Cumpleanos {
  id: number
  cliente: Cliente
  fechaNacimiento: string
  diasParaCumpleanos: number
  mes: number
  dia: number
}

// Estado reactivo
const cumpleanos = ref<Cumpleanos[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Props y emits
defineProps<{
  maxItems?: number
}>()

// Datos mock - luego se conectará a Supabase
const fetchCumpleanos = async () => {
  loading.value = true
  error.value = null

  try {
    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 600))

    cumpleanos.value = [
      {
        id: 1,
        cliente: {
          id: 1,
          nombre: 'María',
          apellido: 'González',
          email: 'maria@email.com',
          telefono: '+57 300 123 4567',
        },
        fechaNacimiento: '1990-01-15',
        diasParaCumpleanos: 3,
        mes: 1,
        dia: 15,
      },
      {
        id: 2,
        cliente: {
          id: 2,
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          email: 'carlos@email.com',
          telefono: '+57 301 987 6543',
        },
        fechaNacimiento: '1985-01-18',
        diasParaCumpleanos: 6,
        mes: 1,
        dia: 18,
      },
      {
        id: 3,
        cliente: {
          id: 3,
          nombre: 'Ana',
          apellido: 'López',
          email: 'ana@email.com',
          telefono: '+57 302 456 7890',
        },
        fechaNacimiento: '1992-01-22',
        diasParaCumpleanos: 10,
        mes: 1,
        dia: 22,
      },
      {
        id: 4,
        cliente: {
          id: 4,
          nombre: 'Luis',
          apellido: 'Martínez',
          email: 'luis@email.com',
          telefono: '+57 303 321 6547',
        },
        fechaNacimiento: '1988-01-28',
        diasParaCumpleanos: 16,
        mes: 1,
        dia: 28,
      },
    ]
  } catch (err) {
    error.value = 'Error al cargar los cumpleaños'
    console.error('Error fetching cumpleaños:', err)
  } finally {
    loading.value = false
  }
}

// Funciones auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  })
}

const calcularEdad = (fechaNacimiento: string) => {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }

  return edad
}

const getProximidadClass = (diasParaCumpleanos: number) => {
  if (diasParaCumpleanos <= 3) return 'text-red-600 font-medium'
  if (diasParaCumpleanos <= 7) return 'text-orange-600 font-medium'
  if (diasParaCumpleanos <= 15) return 'text-blue-600 font-medium'
  return 'text-gray-600'
}

const getProximidadBadgeClass = (diasParaCumpleanos: number) => {
  if (diasParaCumpleanos <= 3) return 'bg-red-100 text-red-800'
  if (diasParaCumpleanos <= 7) return 'bg-orange-100 text-orange-800'
  if (diasParaCumpleanos <= 15) return 'bg-gray-100 text-gray-700'
  return 'bg-gray-100 text-gray-700'
}

const getProximidadText = (diasParaCumpleanos: number) => {
  if (diasParaCumpleanos === 0) return '¡Hoy es su cumpleaños!'
  if (diasParaCumpleanos === 1) return 'Mañana cumple años'
  if (diasParaCumpleanos <= 3) return `En ${diasParaCumpleanos} días`
  if (diasParaCumpleanos <= 7) return `Próxima semana`
  if (diasParaCumpleanos <= 15) return `En ${diasParaCumpleanos} días`
  return `En ${diasParaCumpleanos} días`
}

const getProximidadBadgeText = (diasParaCumpleanos: number) => {
  if (diasParaCumpleanos === 0) return '¡Hoy!'
  if (diasParaCumpleanos <= 3) return 'Urgente'
  if (diasParaCumpleanos <= 7) return 'Próximo'
  if (diasParaCumpleanos <= 15) return 'Monitoreo'
  return 'Lejano'
}

// Inicializar
onMounted(() => {
  fetchCumpleanos()
})
</script>
