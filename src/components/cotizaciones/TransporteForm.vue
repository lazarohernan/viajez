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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Cotización de Transporte</h3>
      <p class="text-sm text-gray-600">Complete los detalles del servicio de transporte</p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Tipo de Transporte -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Transporte</label>
        <select
          v-model="formData.tipo"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >
          <option value="">Seleccione un tipo</option>
          <option value="aereo">Aéreo</option>
          <option value="tren">Tren</option>
          <option value="bus">Bus</option>
          <option value="carro_privado">Carro Privado</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Proveedor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
        <input
          v-model="formData.proveedor"
          type="text"
          placeholder="Ej: Avianca, Uber, etc."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <!-- Origen y Destino -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Origen</label>
          <input
            v-model="formData.origen"
            type="text"
            placeholder="Ciudad de salida"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Destino</label>
          <input
            v-model="formData.destino"
            type="text"
            placeholder="Ciudad de llegada"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <!-- Checkbox de Retorno -->
      <div class="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <input
          v-model="formData.tieneRetorno"
          type="checkbox"
          id="tieneRetorno"
          class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
        />
        <label for="tieneRetorno" class="text-sm font-medium text-gray-900 cursor-pointer">
          ¿Tiene retorno? (Viaje de ida y vuelta)
        </label>
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Fecha de Salida * </label>
          <input
            v-model="formData.fechaInicial"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div v-if="formData.tieneRetorno">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Fecha de Regreso * </label>
          <input
            v-model="formData.fechaFinal"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            :required="formData.tieneRetorno"
          />
        </div>
      </div>

      <!-- Hora Salida/Entrada -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Salida *</label>
          <input
            v-model="formData.horaSalida"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div v-if="formData.tieneRetorno">
          <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Llegada *</label>
          <input
            v-model="formData.horaEntrada"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            :required="formData.tieneRetorno"
          />
        </div>
      </div>

      <!-- Duración del Segmento -->
      <div v-if="formData.tieneRetorno">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Duración del Viaje (Ida y Vuelta)
        </label>
        <input
          v-model="duracionCalculada"
          type="text"
          readonly
          class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
        />
      </div>
      <div v-else class="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-center gap-2 text-blue-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm font-medium">Transporte solo de ida (sin retorno)</span>
        </div>
      </div>

      <!-- Adiciones/Observaciones -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Adiciones/Observaciones
        </label>
        <textarea
          v-model="formData.observaciones"
          rows="3"
          placeholder="Detalles adicionales del servicio..."
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
import { ref, computed, watch } from 'vue'

interface TransporteFormData extends Record<string, unknown> {
  tipo: string
  proveedor: string
  tieneRetorno: boolean
  origen: string
  destino: string
  fechaSalida: string
  fechaEntrada: string
  fecha_inicio: string
  fecha_fin: string
  horaSalida: string
  horaEntrada: string
  duracion: string
  segmento: string
  observaciones: string
}

const emit = defineEmits<{
  submit: [data: TransporteFormData]
  cancel: []
}>()

const formData = ref({
  tipo: '',
  proveedor: '',
  origen: '',
  destino: '',
  tieneRetorno: true,
  fechaInicial: '',
  fechaFinal: '',
  horaSalida: '',
  horaEntrada: '',
  observaciones: '',
})

const duracionCalculada = computed(() => {
  // Solo calcular duración si tiene retorno
  if (!formData.value.tieneRetorno) {
    return 'Solo ida'
  }

  if (formData.value.fechaInicial && formData.value.fechaFinal) {
    const inicio = new Date(formData.value.fechaInicial)
    const fin = new Date(formData.value.fechaFinal)
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '0 días'
    if (diffDays === 1) return '1 día'

    // Calcular horas y minutos si es necesario
    const hours = Math.floor(diffTime / (1000 * 60 * 60))
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))

    return `${diffDays} días (${hours} horas, ${minutes} minutos)`
  }
  return ''
})

// Limpiar fecha final y hora entrada cuando se desmarca retorno
watch(
  () => formData.value.tieneRetorno,
  (tieneRetorno) => {
    if (!tieneRetorno) {
      formData.value.fechaFinal = formData.value.fechaInicial
      formData.value.horaEntrada = ''
    }
  },
)

const handleSubmit = () => {
  emit('submit', {
    ...formData.value,
    fechaSalida: formData.value.fechaInicial || '',
    fechaEntrada: formData.value.fechaFinal || '',
    fecha_inicio: formData.value.fechaInicial || '',
    fecha_fin: formData.value.fechaFinal || '',
    horaEntrada: formData.value.horaEntrada || '',
    duracion: duracionCalculada.value || '',
    segmento: 'Transporte',
    origen: formData.value.origen || '',
    destino: formData.value.destino || '',
  } as TransporteFormData)
}
</script>
