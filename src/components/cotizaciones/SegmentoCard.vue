<template>
  <div
    class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 bg-white relative shadow-sm"
  >
    <!-- Barra lateral de color con texto (estilo ticket) -->
    <div
      class="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center"
      :class="getBorderColorClass()"
    >
      <span
        class="text-white text-xs font-bold tracking-wider whitespace-nowrap"
        style="writing-mode: vertical-rl; transform: rotate(180deg)"
      >
        {{ segmento.es_primero ? 'INICIO' : segmento.es_ultimo ? 'FIN' : 'INTERMEDIO' }}
      </span>
    </div>

    <!-- Contenido principal del ticket -->
    <div class="p-4 pl-10">
      <!-- Header del ticket -->
      <div class="flex items-center justify-between mb-4">
        <!-- Badges de estado -->
        <div class="flex items-center gap-2">
          <span
            class="inline-flex px-3 py-1 text-xs font-semibold rounded-md"
            :class="getTipoBadgeClass()"
          >
            {{ getTipoDisplayName() }}
          </span>
          <span
            v-if="
              segmento.tipo === 'transporte' &&
              segmento.segmento_transporte &&
              segmento.segmento_transporte.tipo_transporte === 'aereo'
            "
            class="inline-flex px-3 py-1 text-xs font-semibold rounded-md bg-orange-200 text-orange-900"
          >
            <Plane class="w-3 h-3 mr-1" />
            Vuelo
          </span>
          <span
            v-if="
              segmento.tipo === 'transporte' &&
              segmento.segmento_transporte &&
              segmento.segmento_transporte.es_parte_escala &&
              segmento.segmento_transporte.tiempo_escala_minutos
            "
            class="inline-flex px-3 py-1 text-xs font-semibold rounded-md bg-amber-200 text-amber-900"
          >
            <Clock class="w-3 h-3 mr-1" />
            Escala {{ formatearTiempoEscala(segmento.segmento_transporte.tiempo_escala_minutos) }}
          </span>
        </div>
      </div>

      <!-- Información principal en layout horizontal -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-0 mb-4">
        <!-- Columna 1: Información básica -->
        <div class="space-y-2 lg:pr-4">
          <h4 class="font-bold text-gray-900 text-lg">
            {{ getSegmentoNombre() }}
          </h4>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Calendar class="w-4 h-4 text-orange-500" />
            <span class="font-medium">{{ formatFechas() }}</span>
          </div>
          <div
            v-if="formatHorarios() !== 'Sin horario'"
            class="flex items-center gap-2 text-sm text-gray-600"
          >
            <Clock class="w-4 h-4 text-amber-500" />
            <span class="font-medium">{{ formatHorarios() }}</span>
          </div>
        </div>

        <!-- Separador zigzag -->
        <div class="hidden lg:flex items-center justify-center py-4">
          <div class="zigzag-divider-full"></div>
        </div>

        <!-- Columna 2: Detalles específicos del tipo -->
        <div class="space-y-2 lg:px-4">
          <div
            v-if="segmento.tipo === 'transporte' && segmento.segmento_transporte"
            class="space-y-1"
          >
            <div class="flex items-center gap-2 text-sm">
              <span class="font-semibold text-gray-700">Origen:</span>
              <span class="text-gray-600">{{ segmento.segmento_transporte.origen || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="font-semibold text-gray-700">Destino:</span>
              <span class="text-gray-600">{{ segmento.segmento_transporte.destino || 'N/A' }}</span>
            </div>
            <div
              v-if="segmento.segmento_transporte.codigo_reserva"
              class="flex items-center gap-2 text-sm"
            >
              <span class="font-semibold text-gray-700">Reserva:</span>
              <span class="text-gray-600 font-mono">
                {{ segmento.segmento_transporte.codigo_reserva }}
              </span>
            </div>
          </div>
          <div
            v-else-if="segmento.tipo === 'hospedaje' && segmento.segmento_hospedaje"
            class="space-y-1"
          >
            <div class="flex items-center gap-2 text-sm">
              <span class="font-semibold text-gray-700">Tipo:</span>
              <span class="text-gray-600">{{ segmento.segmento_hospedaje.tipo_hospedaje }}</span>
            </div>
          </div>
          <div
            v-else-if="segmento.tipo === 'actividad' && segmento.segmento_actividad"
            class="space-y-1"
          >
            <div
              v-if="segmento.segmento_actividad.duracion_horas"
              class="flex items-center gap-2 text-sm"
            >
              <span class="font-semibold text-gray-700">Duración:</span>
              <span class="text-gray-600">{{ segmento.segmento_actividad.duracion_horas }}h</span>
            </div>
          </div>
        </div>

        <!-- Separador zigzag -->
        <div class="hidden lg:flex items-center justify-center py-4">
          <div class="zigzag-divider-full"></div>
        </div>
        <!-- Columna 3: Información adicional -->
        <div class="space-y-2 lg:pl-4">
          <div v-if="segmento.duracion" class="flex items-center gap-2 text-sm">
            <span class="font-semibold text-gray-700">Duración:</span>
            <span class="text-gray-600">{{ segmento.duracion }}</span>
          </div>
          <div v-if="segmento.observaciones" class="text-sm">
            <span class="font-semibold text-gray-700">Observaciones:</span>
            <p class="text-gray-600 mt-1 text-xs italic">{{ segmento.observaciones }}</p>
          </div>
        </div>
      </div>

      <!-- Footer con acciones -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100">
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span>Orden: {{ segmento.orden }}</span>
          <span v-if="segmento.created_at">• Creado: {{ formatDate(segmento.created_at) }}</span>
        </div>
        <!-- Botones de acción -->
        <div class="flex items-center gap-2">
          <button
            class="drag-handle p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-move"
            title="Arrastrar para reordenar"
            type="button"
          >
            <GripVertical class="w-4 h-4" />
          </button>
          <button
            @click="handleVerDetalles"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver detalles"
            type="button"
          >
            <Eye class="w-4 h-4" />
          </button>
          <button
            @click="handleEditar"
            class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Editar segmento"
            type="button"
          >
            <Pencil class="w-4 h-4" />
          </button>
          <button
            @click="handleEliminar"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar segmento"
            type="button"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <SegmentoDetailModal
      v-model="showDetailModal"
      :segmento="segmento"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plane, Calendar, Clock, Pencil, Trash2, GripVertical, Eye } from 'lucide-vue-next'
import type { Segmento } from '@/services/supabase'
import SegmentoDetailModal from '@/components/SegmentoDetailModal.vue'

const props = defineProps<{
  segmento: Segmento
}>()

const emit = defineEmits<{
  editar: []
  eliminar: []
  verDetalles: []
}>()

const showDetailModal = ref(false)

const getBorderColorClass = () => {
  if (props.segmento.es_primero) {
    return 'bg-green-500' // Verde para el primer segmento
  }
  if (props.segmento.es_ultimo) {
    return 'bg-red-500' // Rojo para el último segmento
  }
  return 'bg-orange-400' // Naranja para segmentos intermedios
}

const getTipoBadgeClass = () => {
  switch (props.segmento.tipo) {
    case 'transporte':
      return 'bg-orange-100 text-orange-800'
    case 'hospedaje':
      return 'bg-amber-100 text-amber-800'
    case 'actividad':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-orange-100 text-orange-800'
  }
}

const getTipoDisplayName = () => {
  switch (props.segmento.tipo) {
    case 'transporte':
      return 'Transporte'
    case 'hospedaje':
      return 'Hospedaje'
    case 'actividad':
      return 'Actividad'
    default:
      return 'Segmento'
  }
}

const getSegmentoNombre = () => {
  if (props.segmento.tipo === 'actividad') {
    return props.segmento.nombre || props.segmento.proveedor || 'Actividad'
  }
  return props.segmento.proveedor || props.segmento.nombre || 'Sin proveedor'
}

const formatFechas = () => {
  const s = props.segmento
  if (s.tipo === 'transporte') {
    if (s.fecha_inicio && s.fecha_fin) {
      return `${formatDate(s.fecha_inicio)} → ${formatDate(s.fecha_fin)}`
    }
    return s.fecha_inicio ? formatDate(s.fecha_inicio) : 'Sin fecha'
  }
  if (s.tipo === 'hospedaje') {
    if (s.fecha_inicio && s.fecha_fin) {
      return `${formatDate(s.fecha_inicio)} - ${formatDate(s.fecha_fin)}`
    }
    return 'Sin fecha'
  }
  if (s.tipo === 'actividad') {
    if (s.fecha_inicio && s.fecha_fin && s.fecha_inicio !== s.fecha_fin) {
      return `${formatDate(s.fecha_inicio)} - ${formatDate(s.fecha_fin)}`
    }
    return s.fecha_inicio ? formatDate(s.fecha_inicio) : 'Sin fecha'
  }
  return 'Sin fecha'
}

const formatHorarios = () => {
  const s = props.segmento
  if (s.tipo === 'transporte') {
    if (s.hora_inicio && s.hora_fin) {
      return `${s.hora_inicio} - ${s.hora_fin}`
    }
    return s.hora_inicio || 'Sin horario'
  }
  if (s.tipo === 'actividad' && s.hora_inicio) {
    return `Inicio: ${s.hora_inicio}`
  }
  return 'Sin horario'
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (error) {
    return 'Fecha inválida'
  }
}

const formatearTiempoEscala = (minutos: number): string => {
  if (minutos < 60) {
    return `${minutos} min`
  }

  const horas = Math.floor(minutos / 60)
  const minsRestantes = minutos % 60

  if (minsRestantes === 0) {
    return `${horas}h`
  }

  return `${horas}h ${minsRestantes}min`
}

// Funciones para manejar eventos
const handleEditar = () => {
  emit('editar')
}

const handleVerDetalles = () => {
  showDetailModal.value = true
}

const handleEliminar = () => {
  emit('eliminar')
}
</script>

<style scoped>
.zigzag-divider-full {
  width: 24px;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 100'%3E%3Cpath d='M0,0 L8,12 L0,24 L8,36 L0,48 L8,60 L0,72 L8,84 L0,96 L8,100' stroke='%23d1d5db' stroke-width='2' fill='none'/%3E%3C/svg%3E");
  background-repeat: repeat-y;
  background-position: center;
  background-size: contain;
}
</style>
