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
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Cotización de Hospedaje</h3>
      <p class="text-sm text-gray-600">Complete los detalles del servicio de alojamiento</p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Tipo de Hospedaje -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Hospedaje</label>
        <select
          v-model="formData.tipo"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >
          <option value="">Seleccione un tipo</option>
          <option value="hotel">Hotel</option>
          <option value="renta_privada">Renta Privada</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Proveedor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor/Nombre</label>
        <input
          v-model="formData.proveedor"
          type="text"
          placeholder="Ej: Hotel Hilton, Airbnb, etc."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <!-- Fechas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrada</label>
          <input
            v-model="formData.fechaEntrada"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Salida</label>
          <input
            v-model="formData.fechaSalida"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <!-- Duración del Segmento -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Duración del Segmento (Fecha Salida - Fecha Entrada)
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
          placeholder="Detalles adicionales del hospedaje (habitaciones, servicios incluidos, etc.)..."
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

const emit = defineEmits<{
  submit: [data: any]
  cancel: []
}>()

const formData = ref({
  tipo: '',
  proveedor: '',
  fechaEntrada: '',
  fechaSalida: '',
  observaciones: '',
})

const duracionCalculada = computed(() => {
  if (formData.value.fechaEntrada && formData.value.fechaSalida) {
    const entrada = new Date(formData.value.fechaEntrada)
    const salida = new Date(formData.value.fechaSalida)
    const diffTime = Math.abs(salida.getTime() - entrada.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '0 noches'
    if (diffDays === 1) return '1 noche'
    return `${diffDays} noches`
  }
  return ''
})

const handleSubmit = () => {
  emit('submit', {
    ...formData.value,
    duracion: duracionCalculada.value,
    segmento: 'Hospedaje',
  })
}
</script>
