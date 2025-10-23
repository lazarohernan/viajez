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
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Agregar Hospedaje al Viaje</h3>
      <p class="text-sm text-gray-600">
        Complete los detalles del alojamiento para agregar al viaje
      </p>
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

      <!-- Hotel/Proveedor -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ formData.tipo === 'hotel' ? 'Hotel' : 'Proveedor/Alojamiento' }}
        </label>

        <!-- Select para hoteles cuando es tipo 'hotel' -->
        <select
          v-if="formData.tipo === 'hotel'"
          v-model="formData.proveedor"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >
          <option value="">Seleccionar hotel...</option>
          <optgroup v-for="(hoteles, cadena) in hotelesPorCadena" :key="cadena" :label="cadena">
            <option v-for="hotel in hoteles" :key="hotel.nombre" :value="hotel.nombre">
              {{ hotel.nombre }}
            </option>
          </optgroup>
          <option value="otro">Otro hotel (especificar)</option>
        </select>

        <!-- Campo de texto para otros tipos de hospedaje -->
        <input
          v-else
          v-model="formData.proveedor"
          type="text"
          :placeholder="getPlaceholderForProvider()"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        <!-- Campo para hotel personalizado -->
        <input
          v-if="formData.tipo === 'hotel' && formData.proveedor === 'otro'"
          v-model="proveedorPersonalizado"
          type="text"
          placeholder="Escriba el nombre del hotel..."
          class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        <p class="mt-1 text-xs text-gray-500">
          {{
            formData.tipo === 'hotel'
              ? 'Busca entre todas las cadenas hoteleras o selecciona "Otro hotel"'
              : getHelpTextForProvider()
          }}
        </p>
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
          Guardar Segmento
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { HOTELES } from '@/data/hoteles'

interface HospedajeFormData extends Record<string, unknown> {
  tipo: string
  proveedor: string
  fechaEntrada: string
  fechaSalida: string
  fecha_inicio: string
  fecha_fin: string
  horaEntrada: string
  horaSalida: string
  duracion: string
  segmento: string
  observaciones: string
}

// Props para recibir datos iniciales al editar
const props = defineProps<{
  initialData?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  submit: [data: HospedajeFormData]
  cancel: []
}>()

// Inicializar formData con datos iniciales si existen
const formData = ref({
  tipo:
    ((props.initialData?.segmento_hospedaje as Record<string, unknown>)
      ?.tipo_hospedaje as string) || '',
  proveedor: (props.initialData?.proveedor as string) || '',
  fechaEntrada: (props.initialData?.fecha_inicio as string) || '',
  fechaSalida: (props.initialData?.fecha_fin as string) || '',
  observaciones: (props.initialData?.observaciones as string) || '',
})

console.log('🏨 HospedajeForm inicializado con datos:', {
  initialData: props.initialData,
  formData: formData.value,
})

const proveedorSeleccionado = ref('')
const dropdownOpen = ref(false)
const busquedaHotel = ref('')
const proveedorPersonalizado = ref('')

// Watch para actualizar formData cuando cambien los initialData (al editar)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      // segmento_hospedaje puede venir como array o como objeto
      const segmentoHospedajeRaw = newData.segmento_hospedaje as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | undefined

      console.log('🔄 HospedajeForm recibiendo initialData:', JSON.stringify(newData, null, 2))
      console.log('🏨 segmento_hospedaje RAW:', JSON.stringify(segmentoHospedajeRaw, null, 2))

      // Si viene como array, tomar el primer elemento
      let segmentoHospedaje: Record<string, unknown> | undefined = undefined
      if (Array.isArray(segmentoHospedajeRaw) && segmentoHospedajeRaw.length > 0) {
        segmentoHospedaje = segmentoHospedajeRaw[0]
      } else if (segmentoHospedajeRaw && !Array.isArray(segmentoHospedajeRaw)) {
        segmentoHospedaje = segmentoHospedajeRaw
      }

      const proveedor = (newData.proveedor as string) || ''

      formData.value = {
        tipo: (segmentoHospedaje?.tipo_hospedaje as string) || '',
        proveedor,
        fechaEntrada: (newData.fecha_inicio as string) || '',
        fechaSalida: (newData.fecha_fin as string) || '',
        observaciones: (newData.observaciones as string) || '',
      }

      // Actualizar también proveedorSeleccionado para que el dropdown muestre el hotel
      // Solo si es tipo hotel y el proveedor está en la lista de hoteles
      if (proveedor && formData.value.tipo === 'hotel') {
        // Verificar si el proveedor está en la lista de hoteles
        const hotelEncontrado = HOTELES.find((hotel) => hotel.nombre === proveedor)
        if (hotelEncontrado) {
          proveedorSeleccionado.value = proveedor
        } else {
          // Si no está en la lista, marcar como "otro"
          formData.value.proveedor = 'otro'
          proveedorPersonalizado.value = proveedor
        }
        console.log('🏨 Hotel seleccionado en dropdown:', proveedor)
      }

      console.log(
        '✅ HospedajeForm actualizado con nuevos datos:',
        JSON.stringify(formData.value, null, 2),
      )
    }
  },
  { immediate: true },
)

// Agrupar hoteles por cadena para el select
const hotelesPorCadena = computed(() => {
  const grupos: Record<string, Array<{ nombre: string; cadena: string }>> = {}

  HOTELES.forEach((hotel) => {
    if (!grupos[hotel.cadena]) {
      grupos[hotel.cadena] = []
    }
    grupos[hotel.cadena].push(hotel)
  })

  return grupos
})

// Función para obtener placeholder según el tipo de hospedaje
const getPlaceholderForProvider = (): string => {
  switch (formData.value.tipo) {
    case 'renta_privada':
      return 'Ej: Airbnb, Booking.com, HomeAway...'
    case 'otro':
      return 'Ej: Hostal, Posada, Camping...'
    default:
      return 'Nombre del proveedor o alojamiento'
  }
}

// Función para obtener texto de ayuda según el tipo de hospedaje
const getHelpTextForProvider = (): string => {
  switch (formData.value.tipo) {
    case 'renta_privada':
      return 'Ingresa el nombre de la plataforma de renta privada'
    case 'otro':
      return 'Ingresa el nombre del alojamiento o servicio'
    default:
      return 'Ingresa el nombre del proveedor'
  }
}

// Limpiar valores relacionados con hoteles cuando cambie el tipo
watch(
  () => formData.value.tipo,
  (nuevoTipo) => {
    // Si cambió a algo que no es hotel, limpiar valores de hoteles
    if (nuevoTipo !== 'hotel') {
      proveedorSeleccionado.value = ''
      proveedorPersonalizado.value = ''
      busquedaHotel.value = ''
      dropdownOpen.value = false
      formData.value.proveedor = ''
    }
  },
)

// Cerrar dropdown al hacer clic fuera
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.relative')
  if (!dropdown) {
    dropdownOpen.value = false
    busquedaHotel.value = ''
  }
}

// Agregar listener para cerrar dropdown
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
  // Determinar el proveedor final
  let proveedorFinal = formData.value.proveedor

  // Si es hotel personalizado, usar el valor del campo personalizado
  if (formData.value.tipo === 'hotel' && proveedorFinal === 'otro') {
    proveedorFinal = proveedorPersonalizado.value
  }

  emit('submit', {
    ...formData.value,
    proveedor: proveedorFinal,
    fecha_inicio: formData.value.fechaEntrada,
    fecha_fin: formData.value.fechaSalida,
    horaEntrada: '',
    horaSalida: '',
    duracion: duracionCalculada.value,
    segmento: 'Hospedaje',
  } as HospedajeFormData)
}
</script>
