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
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Agregar Transporte al Viaje</h3>
      <p class="text-sm text-gray-600">
        Complete los detalles del transporte para agregar al viaje
      </p>
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
          <option v-for="(label, value) in ETIQUETAS_TRANSPORTE" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>

      <!-- Aerolínea (solo para transporte aéreo) -->
      <div v-if="formData.tipo === 'aereo'" class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Aerolínea</label>

        <!-- Campo de selección con búsqueda -->
        <div class="relative">
          <button
            type="button"
            @click="toggleDropdown"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-left flex items-center justify-between"
            :class="{ 'border-orange-500': dropdownOpen }"
          >
            <span :class="{ 'text-gray-500': !proveedorSeleccionado }">
              {{ proveedorSeleccionado || 'Seleccionar aerolínea...' }}
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
            <!-- Campo de búsqueda dentro del dropdown -->
            <div class="p-2 border-b border-gray-200">
              <div class="relative">
                <input
                  v-model="busquedaAerolinea"
                  type="text"
                  placeholder="Buscar aerolínea..."
                  class="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  @input="filtrarAerolineas"
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

            <!-- Lista de aerolíneas filtradas -->
            <div class="max-h-48 overflow-y-auto">
              <!-- Opción para proveedores personalizados -->
              <button
                type="button"
                @click="seleccionarAerolineaPersonalizada"
                class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm border-b border-gray-100"
              >
                <span class="text-orange-600 font-medium">+ Otra aerolínea (especificar)</span>
              </button>

              <!-- Aerolíneas filtradas -->
              <button
                v-for="aerolinea in aerolineasFiltradas"
                :key="aerolinea.codigo"
                type="button"
                @click="seleccionarAerolinea(aerolinea)"
                class="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none text-sm"
              >
                <div class="flex items-center justify-between">
                  <span>{{ aerolinea.nombre }}</span>
                  <span class="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">{{
                    aerolinea.codigo
                  }}</span>
                </div>
              </button>

              <!-- Mensaje cuando no hay resultados -->
              <div
                v-if="aerolineasFiltradas.length === 0 && busquedaAerolinea"
                class="px-3 py-2 text-sm text-gray-500 text-center"
              >
                No se encontraron aerolíneas
              </div>
            </div>
          </div>
        </div>

        <!-- Campo adicional para aerolínea personalizada -->
        <div v-if="proveedorSeleccionado === 'personalizado'" class="mt-2">
          <input
            v-model="proveedorPersonalizado"
            type="text"
            placeholder="Ej: Aerolínea XYZ, LATAM, etc."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <p class="text-xs text-gray-500 mt-1">
          Busca entre todas las aerolíneas o selecciona "Otra aerolínea"
        </p>
      </div>

      <!-- Proveedor (para otros tipos de transporte) -->
      <div v-else-if="formData.tipo && formData.tipo !== 'aereo'">
        <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor/Transporte</label>
        <input
          v-model="formData.proveedor"
          type="text"
          :placeholder="getPlaceholderPorTipo()"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
        <p class="text-xs text-gray-500 mt-1">
          Ingresa el nombre del proveedor o servicio de
          {{
            ETIQUETAS_TRANSPORTE[formData.tipo as keyof typeof ETIQUETAS_TRANSPORTE].toLowerCase()
          }}
        </p>
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
          Guardar Segmento
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ETIQUETAS_TRANSPORTE } from '@/utils/constants'
import { AEROLINEAS } from '@/data/aerolineas'

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

// Props para recibir datos iniciales al editar
const props = defineProps<{
  initialData?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  submit: [data: TransporteFormData]
  cancel: []
}>()

// Inicializar formData con datos iniciales si existen
const formData = ref({
  tipo:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)
      ?.tipo_transporte as string) || '',
  proveedor: (props.initialData?.proveedor as string) || '',
  origen:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)?.origen as string) || '',
  destino:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)?.destino as string) || '',
  tieneRetorno:
    ((props.initialData?.segmento_transporte as Record<string, unknown>)
      ?.tiene_retorno as boolean) !== false,
  fechaInicial: (props.initialData?.fecha_inicio as string) || '',
  fechaFinal: (props.initialData?.fecha_fin as string) || '',
  horaSalida: (props.initialData?.hora_inicio as string) || '',
  horaEntrada: (props.initialData?.hora_fin as string) || '',
  observaciones: (props.initialData?.observaciones as string) || '',
})

console.log('🎯 TransporteForm inicializado con datos:', {
  initialData: props.initialData,
  formData: formData.value,
})

const proveedorPersonalizado = ref('')
const proveedorSeleccionado = ref('')
const dropdownOpen = ref(false)
const busquedaAerolinea = ref('')

// Watch para actualizar formData cuando cambien los initialData (al editar)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      // segmento_transporte puede venir como array o como objeto
      const segmentoTransporteRaw = newData.segmento_transporte as
        | Record<string, unknown>
        | Record<string, unknown>[]
        | undefined

      console.log('🔄 TransporteForm recibiendo initialData:', JSON.stringify(newData, null, 2))
      console.log('🚗 segmento_transporte RAW:', JSON.stringify(segmentoTransporteRaw, null, 2))
      console.log('🚗 segmento_transporte TYPE:', typeof segmentoTransporteRaw)
      console.log('🚗 segmento_transporte IS ARRAY:', Array.isArray(segmentoTransporteRaw))

      // Si viene como array, tomar el primer elemento
      let segmentoTransporte: Record<string, unknown> | undefined = undefined
      if (Array.isArray(segmentoTransporteRaw) && segmentoTransporteRaw.length > 0) {
        segmentoTransporte = segmentoTransporteRaw[0]
        console.log(
          '🚗 segmento_transporte después de tomar [0]:',
          JSON.stringify(segmentoTransporte, null, 2),
        )
      } else if (segmentoTransporteRaw && !Array.isArray(segmentoTransporteRaw)) {
        segmentoTransporte = segmentoTransporteRaw
      }

      const proveedor = (newData.proveedor as string) || ''
      const tipo = (segmentoTransporte?.tipo_transporte as string) || ''
      const origen = (segmentoTransporte?.origen as string) || ''
      const destino = (segmentoTransporte?.destino as string) || ''
      const tieneRetorno = (segmentoTransporte?.tiene_retorno as boolean) !== false

      console.log('📦 Datos extraídos:', {
        tipo,
        proveedor,
        origen,
        destino,
        tieneRetorno,
      })

      formData.value = {
        tipo,
        proveedor,
        origen,
        destino,
        tieneRetorno,
        fechaInicial: (newData.fecha_inicio as string) || '',
        fechaFinal: (newData.fecha_fin as string) || '',
        horaSalida: (newData.hora_inicio as string) || '',
        horaEntrada: (newData.hora_fin as string) || '',
        observaciones: (newData.observaciones as string) || '',
      }

      // Actualizar también proveedorSeleccionado para que el dropdown muestre la aerolínea
      if (proveedor && tipo === 'aereo') {
        proveedorSeleccionado.value = proveedor
        console.log('✈️ Aerolínea seleccionada en dropdown:', proveedor)
      }

      console.log(
        '✅ TransporteForm actualizado con nuevos datos:',
        JSON.stringify(formData.value, null, 2),
      )
    } else {
      console.log('❌ TransporteForm recibió initialData null/undefined')
    }
  },
  { immediate: true },
)

// Aerolíneas filtradas para el dropdown
const aerolineasFiltradas = computed(() => {
  if (!busquedaAerolinea.value.trim()) {
    return AEROLINEAS // Mostrar todas las aerolíneas si no hay búsqueda
  }

  const busqueda = busquedaAerolinea.value.toLowerCase()
  return AEROLINEAS.filter(
    (aerolinea) =>
      aerolinea.nombre.toLowerCase().includes(busqueda) ||
      aerolinea.codigo.toLowerCase().includes(busqueda),
  )
})

// Funciones para el dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    // Enfocar el input de búsqueda cuando se abre
    nextTick(() => {
      const searchInput = document.querySelector(
        'input[placeholder="Buscar aerolínea..."]',
      ) as HTMLInputElement
      if (searchInput) searchInput.focus()
    })
  }
}

const filtrarAerolineas = () => {
  // La lógica de filtrado está en el computed aerolineasFiltradas
}

const seleccionarAerolinea = (aerolinea: { codigo: string; nombre: string }) => {
  const valorCompleto = `${aerolinea.nombre} (${aerolinea.codigo})`
  proveedorSeleccionado.value = valorCompleto
  formData.value.proveedor = valorCompleto
  dropdownOpen.value = false
  busquedaAerolinea.value = ''
}

const seleccionarAerolineaPersonalizada = () => {
  proveedorSeleccionado.value = 'personalizado'
  formData.value.proveedor = 'personalizado'
  dropdownOpen.value = false
  busquedaAerolinea.value = ''
}

// Función para obtener placeholder según el tipo de transporte
const getPlaceholderPorTipo = (): string => {
  switch (formData.value.tipo) {
    case 'tren':
      return 'Ej: Renfe, Amtrak, TGV, etc.'
    case 'bus':
      return 'Ej: Greyhound, FlixBus, etc.'
    case 'carro_privado':
      return 'Ej: Conductor particular, Taxi, etc.'
    case 'auto_rentado':
      return 'Ej: Hertz, Avis, Europcar, etc.'
    case 'uber':
      return 'Ej: Uber, Didi, Cabify, etc.'
    case 'otro':
      return 'Ej: Ferry, Bicicleta, etc.'
    default:
      return 'Ej: Nombre del proveedor o transporte'
  }
}
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.relative')
  if (!dropdown) {
    dropdownOpen.value = false
    busquedaAerolinea.value = ''
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

// Limpiar valores relacionados con aerolíneas cuando cambie el tipo
watch(
  () => formData.value.tipo,
  (nuevoTipo) => {
    // Si cambió a algo que no es aereo, limpiar valores de aerolíneas
    if (nuevoTipo !== 'aereo') {
      proveedorSeleccionado.value = ''
      proveedorPersonalizado.value = ''
      busquedaAerolinea.value = ''
      dropdownOpen.value = false
      formData.value.proveedor = ''
    }
  },
)

const handleSubmit = () => {
  // Determinar el proveedor final
  let proveedorFinal = proveedorSeleccionado.value || formData.value.proveedor

  // Si es personalizado, usar el valor del input personalizado
  if (proveedorFinal === 'personalizado') {
    proveedorFinal = proveedorPersonalizado.value
  }

  emit('submit', {
    ...formData.value,
    proveedor: proveedorFinal,
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
