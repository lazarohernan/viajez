<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @close="closeModal"
    maxWidth="3xl"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <!-- Icono según tipo -->
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="getIconBgClass(segmento.tipo)"
        >
          <Plane v-if="segmento.tipo === 'transporte'" class="w-5 h-5 text-orange-600" />
          <Home v-else-if="segmento.tipo === 'hospedaje'" class="w-5 h-5 text-blue-600" />
          <Compass v-else class="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Detalles del {{ getTipoDisplayName() }}
          </h3>
          <p class="text-sm text-gray-600">{{ segmento.nombre || segmento.proveedor }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Información básica -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Información General
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-700">Tipo:</span>
              <span class="text-gray-600">{{ getTipoDisplayName() }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-700">Proveedor:</span>
              <span class="text-gray-600">{{ segmento.proveedor }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-700">Nombre:</span>
              <span class="text-gray-600">{{ segmento.nombre || 'N/A' }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <Calendar class="w-4 h-4 text-orange-500" />
              <span class="font-medium text-gray-700">Fecha:</span>
              <span class="text-gray-600">{{ formatFechas() }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Clock class="w-4 h-4 text-orange-500" />
              <span class="font-medium text-gray-700">Horario:</span>
              <span class="text-gray-600">{{ formatHorarios() }}</span>
            </div>
            <div v-if="segmento.duracion" class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-700">Duración:</span>
              <span class="text-gray-600">{{ segmento.duracion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información específica por tipo -->
      <div
        v-if="segmento.tipo === 'transporte' && segmento.segmento_transporte"
        class="bg-orange-50 rounded-lg p-4"
      >
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Plane class="w-5 h-5 text-orange-600" />
          Detalles del Transporte
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-700">Tipo:</span>
              <span class="text-gray-600 capitalize">{{
                segmento.segmento_transporte.tipo_transporte.replace('_', ' ')
              }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-700">Origen:</span>
              <span class="text-gray-600">{{ segmento.segmento_transporte.origen || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium text-gray-700">Destino:</span>
              <span class="text-gray-600">{{ segmento.segmento_transporte.destino || 'N/A' }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-if="segmento.segmento_transporte.codigo_reserva"
              class="flex items-center gap-2 text-sm"
            >
              <span class="font-medium text-gray-700">Código de Reserva:</span>
              <span class="text-gray-600 font-mono">{{
                segmento.segmento_transporte.codigo_reserva
              }}</span>
            </div>
            <div
              v-if="segmento.segmento_transporte.es_parte_escala"
              class="flex items-center gap-2 text-sm"
            >
              <span class="font-medium text-gray-700">Escala:</span>
              <span class="text-amber-600 font-medium">{{
                formatearTiempoEscala(segmento.segmento_transporte.tiempo_escala_minutos || 0)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="segmento.tipo === 'hospedaje' && segmento.segmento_hospedaje"
        class="bg-amber-50 rounded-lg p-4"
      >
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Home class="w-5 h-5 text-amber-600" />
          Detalles del Hospedaje
        </h4>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm">
            <span class="font-medium text-gray-700">Tipo:</span>
            <span class="text-gray-600">{{ segmento.segmento_hospedaje.tipo_hospedaje }}</span>
          </div>
        </div>
      </div>

      <div
        v-else-if="segmento.tipo === 'actividad' && segmento.segmento_actividad"
        class="bg-yellow-50 rounded-lg p-4"
      >
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Compass class="w-5 h-5 text-yellow-600" />
          Detalles de la Actividad
        </h4>
        <div class="space-y-2">
          <div
            v-if="segmento.segmento_actividad.duracion_horas"
            class="flex items-center gap-2 text-sm"
          >
            <span class="font-medium text-gray-700">Duración:</span>
            <span class="text-gray-600"
              >{{ segmento.segmento_actividad.duracion_horas }} horas</span
            >
          </div>
        </div>
      </div>

      <!-- Observaciones -->
      <div v-if="segmento.observaciones" class="bg-yellow-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg
            class="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
          Observaciones
        </h4>
        <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ segmento.observaciones }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          type="button"
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          @click="closeModal"
        >
          Cerrar
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { Plane, Home, Compass, Calendar, Clock } from 'lucide-vue-next'
import Modal from './ui/Modal.vue'
import type { Segmento } from '@/services/supabase'

interface Props {
  modelValue: boolean
  segmento: Segmento
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'update:modelValue': [value: boolean]
}>()

const getIconBgClass = (tipo: string) => {
  switch (tipo) {
    case 'transporte':
      return 'bg-orange-100'
    case 'hospedaje':
      return 'bg-blue-100'
    case 'actividad':
      return 'bg-green-100'
    default:
      return 'bg-gray-100'
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

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
