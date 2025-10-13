<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header con información del cliente -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ authStore.user?.nombre }} {{ authStore.user?.apellido }}
              </h1>
              <p class="text-gray-600">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <button
            @click="logout"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <LogOut class="w-4 h-4 mr-2" />
            Salir
          </button>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Pestañas -->
      <div class="mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'en-curso'"
              :class="[
                activeTab === 'en-curso'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              ]"
            >
              <div class="flex items-center gap-2">
                <PlayCircle class="w-4 h-4" />
                En Curso
                <span
                  v-if="viajesEnCurso.length > 0"
                  class="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full"
                >
                  {{ viajesEnCurso.length }}
                </span>
              </div>
            </button>
            <button
              @click="activeTab = 'finalizados'"
              :class="[
                activeTab === 'finalizados'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              ]"
            >
              <div class="flex items-center gap-2">
                <CheckCircle class="w-4 h-4" />
                Finalizados
                <span
                  v-if="viajesFinalizados.length > 0"
                  class="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full"
                >
                  {{ viajesFinalizados.length }}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenido de las pestañas -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Pestaña En Curso -->
        <div v-if="activeTab === 'en-curso'" class="p-6">
          <div v-if="viajesEnCurso.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <PlayCircle class="w-8 h-8 text-orange-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No tienes viajes en curso</h3>
            <p class="text-gray-600">
              Cuando tengas viajes activos, aparecerán aquí con su progreso.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="viaje in viajesEnCurso"
              :key="viaje.id"
              class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="verDetalleViaje(viaje)"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ viaje.nombre }}</h3>
                  <p class="text-gray-600">{{ viaje.destino }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDateRange(viaje.fechaInicio, viaje.fechaFin) }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-orange-600">{{ viaje.progreso }}%</div>
                  <div class="text-xs text-gray-500">Completado</div>
                </div>
              </div>

              <!-- Barra de progreso -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso del viaje</span>
                  <span>{{ viaje.progreso }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: viaje.progreso + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Segmentos -->
              <div class="space-y-3">
                <h4 class="text-sm font-medium text-gray-900">Segmentos del viaje:</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    v-for="segmento in viaje.segmentos"
                    :key="segmento.id"
                    class="flex items-center gap-2 p-3 rounded-lg border"
                    :class="getSegmentoClass(segmento.estado)"
                  >
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="getSegmentoDotClass(segmento.estado)"
                    ></div>
                    <div class="flex-1">
                      <div class="text-sm font-medium">{{ segmento.nombre }}</div>
                      <div class="text-xs text-gray-500">{{ segmento.duracion }}</div>
                    </div>
                    <div class="text-xs font-medium" :class="getSegmentoTextClass(segmento.estado)">
                      {{ segmento.estado }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña Finalizados -->
        <div v-if="activeTab === 'finalizados'" class="p-6">
          <div v-if="viajesFinalizados.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No tienes viajes finalizados</h3>
            <p class="text-gray-600">Los viajes completados aparecerán aquí.</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="viaje in viajesFinalizados"
              :key="viaje.id"
              class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="verDetalleViaje(viaje)"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ viaje.nombre }}</h3>
                  <p class="text-gray-600">{{ viaje.destino }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDateRange(viaje.fechaInicio, viaje.fechaFin) }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-5 h-5 text-green-600" />
                    <span class="text-sm font-medium text-green-600">100% Completado</span>
                  </div>
                  <div class="text-xs text-gray-500">
                    Finalizado el {{ formatDate(viaje.fechaFin) }}
                  </div>
                </div>
              </div>

              <!-- Resumen del viaje -->
              <div class="bg-green-50 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div class="font-medium text-gray-900">Duración total</div>
                    <div class="text-gray-600">
                      {{ calcularDuracion(viaje.fechaInicio, viaje.fechaFin) }}
                    </div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">Destino</div>
                    <div class="text-gray-600">{{ viaje.destino }}</div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">Estado</div>
                    <div class="text-green-600 font-medium">Finalizado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalle del viaje -->
      <Modal
        v-model="showViajeModal"
        :title="`Detalle del viaje: ${selectedViaje?.nombre}`"
        max-width="2xl"
      >
        <div v-if="selectedViaje" class="space-y-6">
          <!-- Información principal del viaje -->
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <PlayCircle v-if="activeTab === 'en-curso'" class="w-6 h-6 text-orange-600" />
              <CheckCircle v-else class="w-6 h-6 text-green-600" />
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900 mb-1">{{ selectedViaje.nombre }}</h2>
              <div class="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin class="w-4 h-4" />
                <span>{{ selectedViaje.destino }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600 mb-3">
                <Calendar class="w-4 h-4" />
                <span>{{
                  formatDateRange(selectedViaje.fechaInicio, selectedViaje.fechaFin)
                }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-gray-600" />
                <span class="text-gray-600">{{
                  calcularDuracion(selectedViaje.fechaInicio, selectedViaje.fechaFin)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Estado del viaje -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-900">Estado del viaje</span>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  selectedViaje.progreso === 100
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                "
              >
                {{ selectedViaje.progreso === 100 ? 'Completado' : 'En progreso' }}
              </span>
            </div>

            <!-- Barra de progreso -->
            <div class="mb-2">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{{ selectedViaje.progreso }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="selectedViaje.progreso === 100 ? 'bg-green-500' : 'bg-orange-500'"
                  :style="{ width: selectedViaje.progreso + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Segmentos del viaje -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Segmentos del viaje</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="segmento in selectedViaje.segmentos"
                :key="segmento.id"
                class="flex items-center gap-3 p-3 rounded-lg border"
                :class="getSegmentoClass(segmento.estado)"
              >
                <div
                  class="w-3 h-3 rounded-full"
                  :class="getSegmentoDotClass(segmento.estado)"
                ></div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ segmento.nombre }}</div>
                  <div class="text-sm text-gray-600">{{ segmento.duracion }}</div>
                </div>
                <div class="text-xs font-medium" :class="getSegmentoTextClass(segmento.estado)">
                  {{ segmento.estado }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, LogOut, PlayCircle, CheckCircle, Calendar, MapPin, Clock } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/ui/Modal.vue'

// Interfaces
interface Segmento {
  id: number
  nombre: string
  tipo: 'transporte' | 'hospedaje' | 'actividad'
  estado: 'activo' | 'inactivo' | 'finalizado'
  duracion: string
}

interface Viaje {
  id: number
  nombre: string
  destino: string
  fechaInicio: string
  fechaFin: string
  progreso: number
  segmentos: Segmento[]
  cliente: string
}

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'en-curso' | 'finalizados'>('en-curso')

// Estado para el modal de detalle del viaje
const showViajeModal = ref(false)
const selectedViaje = ref<Viaje | null>(null)

// Datos mock para viajes en curso
const viajesEnCurso = ref<Viaje[]>([
  {
    id: 1,
    nombre: 'Viaje a Bogotá',
    destino: 'Bogotá, Colombia',
    fechaInicio: '2024-12-15',
    fechaFin: '2024-12-20',
    progreso: 65,
    cliente: 'Ana López',
    segmentos: [
      {
        id: 1,
        nombre: 'Vuelo de ida',
        tipo: 'transporte',
        estado: 'finalizado',
        duracion: '2 horas',
      },
      {
        id: 2,
        nombre: 'Hotel Bogotá',
        tipo: 'hospedaje',
        estado: 'activo',
        duracion: '4 días',
      },
      {
        id: 3,
        nombre: 'City Tour',
        tipo: 'actividad',
        estado: 'inactivo',
        duracion: '1 día',
      },
      {
        id: 4,
        nombre: 'Vuelo de regreso',
        tipo: 'transporte',
        estado: 'inactivo',
        duracion: '2 horas',
      },
    ],
  },
  {
    id: 2,
    nombre: 'Escapada a Cancún',
    destino: 'Cancún, México',
    fechaInicio: '2024-12-28',
    fechaFin: '2025-01-03',
    progreso: 20,
    cliente: 'Ana López',
    segmentos: [
      {
        id: 5,
        nombre: 'Vuelo a Cancún',
        tipo: 'transporte',
        estado: 'inactivo',
        duracion: '3 horas',
      },
      {
        id: 6,
        nombre: 'Resort Cancún',
        tipo: 'hospedaje',
        estado: 'inactivo',
        duracion: '5 días',
      },
      {
        id: 7,
        nombre: 'Tour Chichén Itzá',
        tipo: 'actividad',
        estado: 'inactivo',
        duracion: '1 día',
      },
    ],
  },
])

// Datos mock para viajes finalizados
const viajesFinalizados = ref<Viaje[]>([
  {
    id: 3,
    nombre: 'Tour por Europa',
    destino: 'París, Roma, Barcelona',
    fechaInicio: '2024-10-01',
    fechaFin: '2024-10-15',
    progreso: 100,
    cliente: 'Ana López',
    segmentos: [
      {
        id: 8,
        nombre: 'Vuelo a París',
        tipo: 'transporte',
        estado: 'finalizado',
        duracion: '8 horas',
      },
      {
        id: 9,
        nombre: 'Hotel París',
        tipo: 'hospedaje',
        estado: 'finalizado',
        duracion: '4 días',
      },
      {
        id: 10,
        nombre: 'Tour Torre Eiffel',
        tipo: 'actividad',
        estado: 'finalizado',
        duracion: '1 día',
      },
      {
        id: 11,
        nombre: 'Tren a Roma',
        tipo: 'transporte',
        estado: 'finalizado',
        duracion: '6 horas',
      },
      {
        id: 12,
        nombre: 'Hotel Roma',
        tipo: 'hospedaje',
        estado: 'finalizado',
        duracion: '5 días',
      },
      {
        id: 13,
        nombre: 'Coliseo Tour',
        tipo: 'actividad',
        estado: 'finalizado',
        duracion: '1 día',
      },
    ],
  },
])

// Funciones auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateRange = (inicio: string, fin: string) => {
  return `${formatDate(inicio)} - ${formatDate(fin)}`
}

const calcularDuracion = (inicio: string, fin: string) => {
  const inicioDate = new Date(inicio)
  const finDate = new Date(fin)
  const diffTime = Math.abs(finDate.getTime() - inicioDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays} días`
}

const getSegmentoClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'bg-orange-50 border-orange-200'
    case 'finalizado':
      return 'bg-green-50 border-green-200'
    case 'inactivo':
      return 'bg-gray-50 border-gray-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

const getSegmentoDotClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'bg-orange-500'
    case 'finalizado':
      return 'bg-green-500'
    case 'inactivo':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

const getSegmentoTextClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'text-orange-700'
    case 'finalizado':
      return 'text-green-700'
    case 'inactivo':
      return 'text-gray-500'
    default:
      return 'text-gray-500'
  }
}

const verDetalleViaje = (viaje: Viaje) => {
  selectedViaje.value = viaje
  showViajeModal.value = true
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>
