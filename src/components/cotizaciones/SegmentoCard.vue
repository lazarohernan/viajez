<template>
  <div
    class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white"
  >
    <div class="flex items-start justify-between gap-4">
      <!-- Icono y Contenido -->
      <div class="flex items-start gap-3 flex-1">
        <!-- Icono según tipo de segmento -->
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="getIconBgClass()"
        >
          <Plane v-if="segmento.tipo === 'transporte'" class="w-5 h-5 text-orange-600" />
          <Home v-else-if="segmento.tipo === 'hospedaje'" class="w-5 h-5 text-orange-600" />
          <Compass v-else class="w-5 h-5 text-orange-600" />
        </div>

        <!-- Información del segmento -->
        <div class="flex-1 min-w-0">
          <!-- Badge de tipo -->
          <div class="flex items-center gap-2 mb-2">
            <span
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              :class="getTipoBadgeClass()"
            >
              {{ segmento.tipo }}
            </span>
            <span
              v-if="
                segmento.tipo === 'transporte' &&
                segmento.segmento_transporte &&
                !segmento.segmento_transporte.tiene_retorno
              "
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
            >
              Solo ida
            </span>
          </div>

          <!-- Proveedor/Nombre -->
          <h4 class="font-semibold text-gray-900 mb-1">
            {{ getSegmentoNombre() }}
          </h4>

          <!-- Fechas -->
          <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar class="w-4 h-4" />
            <span>{{ formatFechas() }}</span>
          </div>

          <!-- Horarios si aplica -->
          <div
            v-if="formatHorarios() !== 'Sin horario'"
            class="flex items-center gap-2 text-sm text-gray-600 mb-2"
          >
            <Clock class="w-4 h-4" />
            <span>{{ formatHorarios() }}</span>
          </div>

          <!-- Duración -->
          <div v-if="segmento.duracion" class="text-sm text-gray-500">
            Duración: {{ segmento.duracion }}
          </div>

          <!-- Observaciones (solo primeras palabras) -->
          <div v-if="segmento.observaciones" class="mt-2 text-xs text-gray-500 italic line-clamp-2">
            {{ segmento.observaciones }}
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex flex-col gap-2 flex-shrink-0">
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
</template>

<script setup lang="ts">
import { Plane, Home, Compass, Calendar, Clock, Pencil, Trash2 } from 'lucide-vue-next'
import type { Segmento } from '@/services/supabase'

const props = defineProps<{
  segmento: Segmento
}>()

const emit = defineEmits<{
  editar: []
  eliminar: []
}>()

const getIconBgClass = () => {
  switch (props.segmento.tipo) {
    case 'transporte':
      return 'bg-blue-50'
    case 'hospedaje':
      return 'bg-green-50'
    case 'actividad':
      return 'bg-purple-50'
    default:
      return 'bg-gray-50'
  }
}

const getTipoBadgeClass = () => {
  switch (props.segmento.tipo) {
    case 'transporte':
      return 'bg-blue-100 text-blue-800'
    case 'hospedaje':
      return 'bg-green-100 text-green-800'
    case 'actividad':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
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

// Funciones para manejar eventos
const handleEditar = () => {
  emit('editar')
}

const handleEliminar = () => {
  emit('eliminar')
}
</script>
