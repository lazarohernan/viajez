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

        <!-- Dropdown con búsqueda para hoteles cuando es tipo 'hotel' -->
        <div v-if="formData.tipo === 'hotel'" class="relative">
          <button
            type="button"
            @click="toggleDropdown"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-left flex items-center justify-between"
            :class="{ 'border-orange-500': dropdownOpen }"
          >
            <span :class="{ 'text-gray-500': !proveedorSeleccionado }">
              {{ proveedorSeleccionado || 'Seleccionar hotel...' }}
            </span>
            <svg
              class="w-5 h-5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': dropdownOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <!-- Dropdown con búsqueda -->
          <div
            v-if="dropdownOpen"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden"
          >
            <!-- Campo de búsqueda -->
            <div class="p-2 border-b border-gray-200">
              <div class="relative">
                <input
                  v-model="busquedaHotel"
                  type="text"
                  placeholder="Buscar hotel..."
                  class="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  ref="searchInput"
                />
                <svg
                  class="w-4 h-4 text-gray-400 absolute left-2 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <!-- Lista de hoteles -->
            <div class="max-h-48 overflow-y-auto">
              <!-- Opción para agregar hotel -->
              <button
                type="button"
                @click="seleccionarHotelPersonalizado"
                class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm border-b border-gray-100"
              >
                <span class="text-orange-600 font-medium">+ Agregar hotel</span>
              </button>

              <!-- Hoteles filtrados -->
              <button
                v-for="hotel in hotelesFiltrados"
                :key="hotel.id || hotel.nombre"
                type="button"
                @click="seleccionarHotel(hotel)"
                class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm"
              >
                <span>{{ hotel.nombre }}</span>
              </button>

              <!-- Mensaje cuando no hay resultados -->
              <div
                v-if="hotelesFiltrados.length === 0 && busquedaHotel"
                class="px-3 py-2 text-sm text-gray-500 text-center"
              >
                No se encontraron hoteles
              </div>

              <!-- Loading -->
              <div v-if="cargandoHoteles" class="px-3 py-2 text-sm text-gray-500 text-center">
                Cargando hoteles...
              </div>
            </div>
          </div>
        </div>

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
        <div v-if="proveedorSeleccionado === 'personalizado'" class="mt-2">
          <input
            v-model="proveedorPersonalizado"
            type="text"
            placeholder="Escriba el nombre del hotel..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <p class="mt-1 text-xs text-gray-500">
          {{
            formData.tipo === 'hotel'
              ? 'Busca entre todos los hoteles registrados o agrega uno nuevo'
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

      <!-- Horas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Entrada</label>
          <input
            v-model="formData.horaEntrada"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Salida</label>
          <input
            v-model="formData.horaSalida"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { HotelesService, type Hotel } from '@/services/hoteles.service'

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
  horaEntrada: (props.initialData?.hora_inicio as string) || '',
  horaSalida: (props.initialData?.hora_fin as string) || '',
  observaciones: (props.initialData?.observaciones as string) || '',
})

// console.log('🏨 HospedajeForm inicializado con datos:', { initialData: props.initialData, formData: formData.value })

const proveedorSeleccionado = ref('')
const dropdownOpen = ref(false)
const busquedaHotel = ref('')
const proveedorPersonalizado = ref('')
const hoteles = ref<Hotel[]>([])
const cargandoHoteles = ref(false)

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

      // console.log('🔄 HospedajeForm recibiendo initialData:', JSON.stringify(newData, null, 2))
      // console.log('🏨 segmento_hospedaje RAW:', JSON.stringify(segmentoHospedajeRaw, null, 2))

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
        horaEntrada: (newData.hora_inicio as string) || '',
        horaSalida: (newData.hora_fin as string) || '',
        observaciones: (newData.observaciones as string) || '',
      }

      // Actualizar también proveedorSeleccionado para que el dropdown muestre el hotel
      if (proveedor && formData.value.tipo === 'hotel') {
        proveedorSeleccionado.value = proveedor
      }

      // console.log('✅ HospedajeForm actualizado con nuevos datos:', JSON.stringify(formData.value, null, 2))
    }
  },
  { immediate: true },
)

// Cargar hoteles desde Supabase
const cargarHoteles = async () => {
  cargandoHoteles.value = true
  const { data, error } = await HotelesService.getAll()
  if (!error && data) {
    hoteles.value = data
  }
  cargandoHoteles.value = false
}

// Filtrar hoteles según búsqueda
const hotelesFiltrados = computed(() => {
  if (!busquedaHotel.value.trim()) {
    return hoteles.value
  }
  const busqueda = busquedaHotel.value.toLowerCase()
  return hoteles.value.filter((hotel) => hotel.nombre.toLowerCase().includes(busqueda))
})

// Funciones del dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    nextTick(() => {
      const searchInput = document.querySelector(
        'input[placeholder="Buscar hotel..."]',
      ) as HTMLInputElement
      if (searchInput) searchInput.focus()
    })
  }
}

const seleccionarHotel = (hotel: Hotel) => {
  proveedorSeleccionado.value = hotel.nombre
  formData.value.proveedor = hotel.nombre
  dropdownOpen.value = false
  busquedaHotel.value = ''
}

const seleccionarHotelPersonalizado = () => {
  proveedorSeleccionado.value = 'personalizado'
  formData.value.proveedor = 'personalizado'
  dropdownOpen.value = false
  busquedaHotel.value = ''
}

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

// Agregar listener para cerrar dropdown y cargar hoteles
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  cargarHoteles()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const duracionCalculada = computed(() => {
  if (formData.value.fechaEntrada && formData.value.fechaSalida) {
    // Si se proporcionan horas, incluirlas en el cálculo
    if (formData.value.horaEntrada && formData.value.horaSalida) {
      const entrada = new Date(`${formData.value.fechaEntrada}T${formData.value.horaEntrada}`)
      const salida = new Date(`${formData.value.fechaSalida}T${formData.value.horaSalida}`)
      const diffTime = Math.abs(salida.getTime() - entrada.getTime())

      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      if (diffDays === 0 && diffHours === 0) return '0 horas'
      if (diffDays === 0) return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`
      if (diffHours === 0) return `${diffDays} día${diffDays !== 1 ? 's' : ''}`
      return `${diffDays} día${diffDays !== 1 ? 's' : ''} y ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
    }

    // Si no hay horas, calcular solo días/noches
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

const handleSubmit = async () => {
  // Determinar el proveedor final
  let proveedorFinal = formData.value.proveedor

  // Si es hotel personalizado, guardar en Supabase y usar el valor del campo personalizado
  if (formData.value.tipo === 'hotel' && proveedorSeleccionado.value === 'personalizado') {
    proveedorFinal = proveedorPersonalizado.value.trim()

    // Guardar el nuevo hotel en Supabase
    if (proveedorFinal) {
      const { error } = await HotelesService.create(proveedorFinal)
      if (!error) {
        // Recargar la lista de hoteles
        await cargarHoteles()
      } else {
        console.warn('⚠️ Hotel ya existe o error al guardar:', error)
      }
    }
  }

  emit('submit', {
    ...formData.value,
    proveedor: proveedorFinal,
    fecha_inicio: formData.value.fechaEntrada,
    fecha_fin: formData.value.fechaSalida,
    horaEntrada: formData.value.horaEntrada || '',
    horaSalida: formData.value.horaSalida || '',
    duracion: duracionCalculada.value,
    segmento: 'Hospedaje',
  } as HospedajeFormData)
}
</script>
