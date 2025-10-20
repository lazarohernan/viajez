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
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Cotización de Actividades</h3>
      <p class="text-sm text-gray-600">Complete los detalles de la actividad o tour</p>
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
          <label class="block text-sm font-medium text-gray-700 mb-2"> Duración (en horas) </label>
          <input
            v-model.number="formData.duracionHoras"
            type="number"
            min="0"
            step="0.5"
            placeholder="Ej: 2.5"
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
          Guardar Cotización
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ActividadFormData extends Record<string, unknown> {
  nombre: string
  fechaInicial: string
  fechaEntrada: string
  fecha_inicio: string
  horaInicio: string
  horaEntrada: string
  duracion_horas: number
  duracion: string
  segmento: string
  observaciones: string
}

const emit = defineEmits<{
  submit: [data: ActividadFormData]
  cancel: []
}>()

const formData = ref({
  nombre: '',
  fechaInicial: '',
  fechaFinal: '',
  horaInicio: '',
  duracionHoras: 0,
  observaciones: '',
})

const duracionCalculada = computed(() => {
  if (formData.value.fechaInicial && formData.value.fechaFinal) {
    const inicio = new Date(formData.value.fechaInicial)
    const fin = new Date(formData.value.fechaFinal)
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '0 días'
    if (diffDays === 1) return '1 día'

    const totalHoras = formData.value.duracionHoras
    return `${diffDays} días, ${totalHoras} horas`
  }
  return ''
})

const handleSubmit = () => {
  emit('submit', {
    ...formData.value,
    fechaEntrada: formData.value.fechaInicial,
    fecha_inicio: formData.value.fechaInicial,
    horaEntrada: formData.value.horaInicio,
    duracion_horas: formData.value.duracionHoras,
    duracion: duracionCalculada.value,
    segmento: 'Actividades',
  } as ActividadFormData)
}
</script>
