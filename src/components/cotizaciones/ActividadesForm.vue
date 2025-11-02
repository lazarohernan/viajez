<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <div
        class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Agregar Actividad al Viaje</h3>
      <p class="text-sm text-gray-600">
        Complete los detalles de la actividad para agregar al viaje
      </p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nombre de Actividad -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de Actividad</label>
        <input
          v-model="formData.nombre"
          type="text"
          placeholder="Ej: City Tour, Excursión a la montaña, etc."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <!-- Proveedor/Operador -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor/Operador</label>
        <input
          v-model="formData.proveedor"
          type="text"
          placeholder="Ej: Guía Local Tours, Aventura Extrema, etc."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicial</label>
          <input
            v-model="formData.fechaInicial"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Final</label>
          <input
            v-model="formData.fechaFinal"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <!-- Horario -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Inicio</label>
          <input
            v-model="formData.horaInicio"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hora Final</label>
          <input
            v-model="formData.horaFinal"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <!-- Duración del Segmento -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Duración del Segmento (Fecha Final - Fecha Inicial)
        </label>
        <input
          v-model="duracionCalculada"
          type="text"
          readonly
          class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
        />
      </div>

      <!-- Adiciones/Observaciones -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Adiciones/Observaciones
        </label>
        <textarea
          v-model="formData.observaciones"
          rows="3"
          placeholder="Detalles adicionales de la actividad (incluye, requisitos, etc.)..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        ></textarea>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          Guardar Segmento
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ActividadFormData extends Record<string, unknown> {
  nombre: string
  fechaInicial: string
  fechaEntrada: string
  fecha_inicio: string
  horaInicio: string
  horaFinal: string
  horaEntrada: string
  duracion_horas: number
  duracion: string
  segmento: string
  observaciones: string
}

// Props para recibir datos iniciales al editar y fechas del viaje/cotización
const props = defineProps<{
  initialData?: Record<string, unknown> | null
  fechaInicioViaje?: string | null // Fecha de inicio del viaje/cotización para validación
  fechaFinViaje?: string | null // Fecha de fin del viaje/cotización para validación
}>()

const emit = defineEmits<{
  submit: [data: ActividadFormData]
  cancel: []
}>()

const formData = ref({
  nombre: '',
  proveedor: '',
  fechaInicial: '',
  fechaFinal: '',
  horaInicio: '',
  horaFinal: '',
  observaciones: '',
})

// console.log('🎭 ActividadesForm inicializado con datos:', { initialData: props.initialData, formData: formData.value })

// Watch para actualizar formData cuando cambien los initialData (al editar)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        nombre: (newData.nombre as string) || '',
        proveedor: (newData.proveedor as string) || '',
        fechaInicial: (newData.fecha_inicio as string) || '',
        fechaFinal: (newData.fecha_fin as string) || '',
        horaInicio: (newData.hora_inicio as string) || '',
        horaFinal: (newData.hora_fin as string) || '',
        observaciones: (newData.observaciones as string) || '',
      }
    } else {
      // console.log('❌ ActividadesForm recibió initialData null/undefined')
    }
  },
  { immediate: true },
)

const duracionCalculada = computed(() => {
  if (
    formData.value.fechaInicial &&
    formData.value.fechaFinal &&
    formData.value.horaInicio &&
    formData.value.horaFinal
  ) {
    const inicio = new Date(`${formData.value.fechaInicial}T${formData.value.horaInicio}`)
    const fin = new Date(`${formData.value.fechaFinal}T${formData.value.horaFinal}`)
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays === 0 && diffHours === 0) return '0 horas'
    if (diffDays === 0) return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    if (diffHours === 0) return `${diffDays} día${diffDays !== 1 ? 's' : ''}`
    return `${diffDays} día${diffDays !== 1 ? 's' : ''} y ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
  }
  return ''
})

const duracionHorasCalculada = computed(() => {
  if (
    formData.value.fechaInicial &&
    formData.value.fechaFinal &&
    formData.value.horaInicio &&
    formData.value.horaFinal
  ) {
    const inicio = new Date(`${formData.value.fechaInicial}T${formData.value.horaInicio}`)
    const fin = new Date(`${formData.value.fechaFinal}T${formData.value.horaFinal}`)
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60))
  }
  return 0
})

const handleSubmit = () => {
  // Validar fechas del segmento contra fechas del viaje/cotización
  const erroresFecha: Record<string, string> = {}

  // Validar si tenemos ambas fechas del viaje/cotización
  if (props.fechaInicioViaje && props.fechaFinViaje) {
    const fechaInicioViaje = new Date(props.fechaInicioViaje + 'T00:00:00')
    const fechaFinViaje = new Date(props.fechaFinViaje + 'T23:59:59')

    // Validar fecha inicial
    if (formData.value.fechaInicial) {
      const fechaInicialSegmento = new Date(formData.value.fechaInicial + 'T00:00:00')

      if (fechaInicialSegmento < fechaInicioViaje) {
        erroresFecha.fechaInicial = `La fecha inicial no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      } else if (fechaInicialSegmento > fechaFinViaje) {
        erroresFecha.fechaInicial = `La fecha inicial no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }

    // Validar fecha final
    if (formData.value.fechaFinal) {
      const fechaFinalSegmento = new Date(formData.value.fechaFinal + 'T23:59:59')

      if (fechaFinalSegmento < fechaInicioViaje) {
        erroresFecha.fechaFinal = `La fecha final no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      } else if (fechaFinalSegmento > fechaFinViaje) {
        erroresFecha.fechaFinal = `La fecha final no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }
  } else {
    // Si solo tenemos una fecha límite, validar individualmente
    if (props.fechaInicioViaje && formData.value.fechaInicial) {
      const fechaInicioViaje = new Date(props.fechaInicioViaje + 'T00:00:00')
      const fechaInicialSegmento = new Date(formData.value.fechaInicial + 'T00:00:00')

      if (fechaInicialSegmento < fechaInicioViaje) {
        erroresFecha.fechaInicial = `La fecha inicial no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      }
    }

    if (props.fechaFinViaje && formData.value.fechaInicial) {
      const fechaFinViaje = new Date(props.fechaFinViaje + 'T23:59:59')
      const fechaInicialSegmento = new Date(formData.value.fechaInicial + 'T00:00:00')

      if (fechaInicialSegmento > fechaFinViaje) {
        erroresFecha.fechaInicial = `La fecha inicial no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }

    if (props.fechaInicioViaje && formData.value.fechaFinal) {
      const fechaInicioViaje = new Date(props.fechaInicioViaje + 'T00:00:00')
      const fechaFinalSegmento = new Date(formData.value.fechaFinal + 'T23:59:59')

      if (fechaFinalSegmento < fechaInicioViaje) {
        erroresFecha.fechaFinal = `La fecha final no puede ser anterior al inicio del viaje (${props.fechaInicioViaje})`
      }
    }

    if (props.fechaFinViaje && formData.value.fechaFinal) {
      const fechaFinViaje = new Date(props.fechaFinViaje + 'T23:59:59')
      const fechaFinalSegmento = new Date(formData.value.fechaFinal + 'T23:59:59')

      if (fechaFinalSegmento > fechaFinViaje) {
        erroresFecha.fechaFinal = `La fecha final no puede ser posterior al fin del viaje (${props.fechaFinViaje})`
      }
    }
  }

  // Si hay errores de fecha, mostrar alerta y no enviar
  if (Object.keys(erroresFecha).length > 0) {
    const mensajes = Object.values(erroresFecha).join('\n')
    alert(`Error de validación:\n\n${mensajes}`)
    return
  }

  emit('submit', {
    ...formData.value,
    fechaEntrada: formData.value.fechaInicial,
    fecha_inicio: formData.value.fechaInicial,
    fecha_fin: formData.value.fechaFinal,
    horaEntrada: formData.value.horaInicio,
    horaSalida: formData.value.horaFinal,
    duracion_horas: duracionHorasCalculada.value,
    duracion: duracionCalculada.value,
    segmento: 'Actividades',
  } as ActividadFormData)
}
</script>
