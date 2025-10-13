<template>
  <div class="min-h-screen bg-gray-50 py-4">
    <div class="w-full mx-auto px-2 md:px-4 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Segmentos</h1>
          <p class="text-gray-600 text-sm">
            Selecciona el segmento para crear tu cotización de viaje
          </p>
        </div>
      </div>

      <!-- Segmentos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Segmento Transporte -->
        <div
          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group"
          @click="selectSegment('transporte')"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors"
            >
              <Plane class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Transporte</h3>
            </div>
          </div>
        </div>

        <!-- Segmento Hospedaje -->
        <div
          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group"
          @click="selectSegment('hospedaje')"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors"
            >
              <Home class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Hospedaje</h3>
            </div>
          </div>
        </div>

        <!-- Segmento Actividades -->
        <div
          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group"
          @click="selectSegment('actividades')"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors"
            >
              <Compass class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Actividades</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Segmentos Agregados -->
      <div
        v-if="segmentosAgregados.length > 0"
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Segmentos Agregados</h2>
            <p class="text-sm text-gray-600">
              {{ segmentosAgregados.length }} segmento(s) en esta cotización
            </p>
          </div>
          <button
            @click="guardarCotizacionCompleta"
            class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Guardar Cotización Completa
          </button>
        </div>

        <!-- Segmentos ordenados por fecha -->
        <div class="space-y-3">
          <SegmentoCard
            v-for="segmento in segmentosOrdenados"
            :key="segmento.id"
            :segmento="segmento"
            @editar="editarSegmento(segmento)"
            @eliminar="eliminarSegmento(segmento.id)"
          />
        </div>

        <!-- Botón para limpiar todos -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button
            @click="limpiarSegmentos"
            class="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Limpiar todos los segmentos
          </button>
        </div>
      </div>

      <!-- Tabla de cotizaciones -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable
          :columns="tableColumns"
          :rows="tableRows"
          :loading="tableLoading"
          empty-text="No hay cotizaciones creadas aún"
        >
          <template #toolbar>
            <div class="flex items-center justify-between gap-2">
              <input
                v-model="search"
                type="text"
                placeholder="Buscar cotizaciones..."
                class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </template>
          <template #actions="{ row }">
            <button
              class="text-orange-700 hover:text-orange-900 text-sm font-medium"
              @click="editCotizacion(row)"
            >
              Editar
            </button>
          </template>
          <template #cell:cliente="{ row }">
            <div class="font-medium text-gray-900">{{ row.cliente }}</div>
            <div class="text-xs text-gray-500">{{ row.email }}</div>
          </template>
          <template #cell:destino="{ row }">
            <div class="font-medium text-gray-900">{{ row.destino }}</div>
            <div class="text-xs text-gray-500">{{ row.duracion }}</div>
          </template>
          <template #cell:segmento="{ row }">
            <span
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              :class="getSegmentoClass(row.segmento)"
            >
              {{ row.segmento }}
            </span>
          </template>
          <template #cell:fecha="{ row }">
            <div class="text-sm text-gray-900">{{ formatDate(row.fecha) }}</div>
          </template>
        </DataTable>
      </div>

      <!-- Modal para nueva cotización -->
      <Modal v-model="showForm" :max-width="'2xl'" title="" @close="closeForm">
        <!-- Transporte -->
        <TransporteForm
          v-if="selectedSegment === 'transporte'"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />

        <!-- Hospedaje -->
        <HospedajeForm
          v-else-if="selectedSegment === 'hospedaje'"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />

        <!-- Actividades -->
        <ActividadesForm
          v-else-if="selectedSegment === 'actividades'"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
import {
  TransporteForm,
  HospedajeForm,
  ActividadesForm,
  SegmentoCard,
} from '@/components/cotizaciones'
import { Plane, Home, Compass } from 'lucide-vue-next'

// Interfaz para segmentos
interface Segmento {
  id: number
  tipo: 'Transporte' | 'Hospedaje' | 'Actividades'
  proveedor?: string
  nombre?: string
  fechaInicial?: string
  fechaFinal?: string
  fechaEntrada?: string
  fechaSalida?: string
  horaSalida?: string
  horaEntrada?: string
  horaInicio?: string
  duracion?: string
  observaciones?: string
  tieneRetorno?: boolean
  [key: string]: unknown
}

const showForm = ref(false)
const selectedSegment = ref<string>('')
const search = ref('')
const tableLoading = ref(false)
const segmentosAgregados = ref<Segmento[]>([])
const editandoSegmento = ref<Segmento | null>(null)

// Columnas de la tabla de cotizaciones
const tableColumns: DataTableColumn[] = [
  { key: 'cliente', label: 'Cliente', width: '25%' },
  { key: 'destino', label: 'Destino', width: '25%' },
  { key: 'segmento', label: 'Segmento', width: '15%' },
  { key: 'fecha', label: 'Fecha', width: '15%' },
]

// Definir tipo para las filas de cotización
interface CotizacionRow {
  id: number
  cliente: string
  email: string
  destino: string
  duracion: string
  segmento: string
  fecha: string
  presupuesto: number
}

// Datos mock de cotizaciones (vacíos inicialmente)
const allTableRows = ref<CotizacionRow[]>([
  // Datos de ejemplo comentados para que esté vacío inicialmente
  // {
  //   id: 1,
  //   cliente: 'Ana López',
  //   email: 'ana@email.com',
  //   destino: 'Cancún, México',
  //   duracion: '7 días',
  //   segmento: 'Estándar',
  //   fecha: '2024-12-15',
  //   presupuesto: 2500
  // }
])

// Filtrar filas basado en búsqueda
const tableRows = computed(() => {
  if (!search.value) return allTableRows.value
  const term = search.value.toLowerCase()
  return allTableRows.value.filter(
    (row) =>
      String(row.cliente).toLowerCase().includes(term) ||
      String(row.destino).toLowerCase().includes(term) ||
      String(row.segmento).toLowerCase().includes(term),
  )
})

// Computed: segmentos ordenados por fecha
const segmentosOrdenados = computed(() => {
  return [...segmentosAgregados.value].sort((a, b) => {
    const fechaA = a.fechaInicial || a.fechaEntrada || ''
    const fechaB = b.fechaInicial || b.fechaEntrada || ''
    return fechaA.localeCompare(fechaB)
  })
})

const selectSegment = (segment: string) => {
  selectedSegment.value = segment
  editandoSegmento.value = null
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedSegment.value = ''
  editandoSegmento.value = null
}

const handleFormSubmit = (data: Record<string, unknown>) => {
  if (editandoSegmento.value) {
    // Editar segmento existente
    const index = segmentosAgregados.value.findIndex((s) => s.id === editandoSegmento.value!.id)
    if (index !== -1) {
      segmentosAgregados.value[index] = {
        ...editandoSegmento.value,
        ...data,
        id: editandoSegmento.value.id,
      }
    }
    alert(`Segmento actualizado correctamente`)
  } else {
    // Agregar nuevo segmento
    const nuevoSegmento: Segmento = {
      id: Date.now(),
      tipo: data.segmento as 'Transporte' | 'Hospedaje' | 'Actividades',
      ...data,
    }
    segmentosAgregados.value.push(nuevoSegmento)
    alert(`Segmento agregado. Puedes agregar más o guardar la cotización completa.`)
  }

  closeForm()
}

const editarSegmento = (segmento: Segmento) => {
  editandoSegmento.value = segmento
  // Determinar qué tipo de segmento es para abrir el formulario correcto
  if (segmento.tipo === 'Transporte') {
    selectedSegment.value = 'transporte'
  } else if (segmento.tipo === 'Hospedaje') {
    selectedSegment.value = 'hospedaje'
  } else if (segmento.tipo === 'Actividades') {
    selectedSegment.value = 'actividades'
  }
  showForm.value = true
}

const eliminarSegmento = (id: number) => {
  if (confirm('¿Estás seguro de eliminar este segmento?')) {
    segmentosAgregados.value = segmentosAgregados.value.filter((s) => s.id !== id)
  }
}

const limpiarSegmentos = () => {
  if (confirm('¿Estás seguro de eliminar todos los segmentos? Esta acción no se puede deshacer.')) {
    segmentosAgregados.value = []
  }
}

const guardarCotizacionCompleta = () => {
  if (segmentosAgregados.value.length === 0) {
    alert('No hay segmentos para guardar')
    return
  }

  console.log('Cotización completa:', {
    segmentos: segmentosAgregados.value,
    total: segmentosAgregados.value.length,
  })

  // Aquí se guardaría en Supabase
  alert(
    `Cotización guardada con ${segmentosAgregados.value.length} segmentos.\n\nPróximamente: Generación de PDF y guardado en base de datos.`,
  )

  // Limpiar después de guardar
  segmentosAgregados.value = []
}

// Funciones auxiliares para la tabla
const getSegmentoClass = (segmento: string) => {
  switch (segmento) {
    case 'Transporte':
      return 'bg-blue-100 text-blue-800'
    case 'Hospedaje':
      return 'bg-green-100 text-green-800'
    case 'Actividades':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const editCotizacion = (row: CotizacionRow) => {
  console.log('Editar cotización:', row)
  alert('Funcionalidad de edición próximamente disponible')
}
</script>
