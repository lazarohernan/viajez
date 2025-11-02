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
          class="bg-white rounded-lg border border-gray-200 p-4 hover:border-orange-300 transition-all duration-200 cursor-pointer group"
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
          class="bg-white rounded-lg border border-gray-200 p-4 hover:border-amber-300 transition-all duration-200 cursor-pointer group"
          @click="selectSegment('hospedaje')"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors"
            >
              <Home class="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Hospedaje</h3>
            </div>
          </div>
        </div>

        <!-- Segmento Actividades -->
        <div
          class="bg-white rounded-lg border border-gray-200 p-4 hover:border-yellow-300 transition-all duration-200 cursor-pointer group"
          @click="selectSegment('actividades')"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 transition-colors"
            >
              <Compass class="w-5 h-5 text-yellow-600" />
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
        class="bg-white rounded-xl border border-gray-200 p-6"
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

        <!-- Segmentos ordenados - Drag & Drop habilitado -->
        <draggable
          v-model="segmentosAgregados"
          item-key="id"
          class="space-y-3"
          handle=".drag-handle"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <SegmentoCard
              :key="element.id"
              :segmento="element"
              @editar="editarSegmento(element)"
              @eliminar="eliminarSegmento(element.id)"
            />
          </template>
        </draggable>

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
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            <div class="flex items-center justify-center gap-2">
              <button
                @click="verCotizacion(row)"
                class="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                title="Ver cotización"
                type="button"
              >
                <Eye class="w-4 h-4" />
              </button>
              <button
                @click="editCotizacion(row)"
                class="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                title="Editar cotización"
                type="button"
              >
                <Pencil class="w-4 h-4" />
              </button>
              <button
                @click="eliminarCotizacion(row)"
                class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Eliminar cotización"
                type="button"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </template>
          <template #cell:nombre="{ row }">
            <div class="font-semibold text-gray-900">{{ row.nombre }}</div>
            <div class="text-xs text-gray-500 mt-1">ID: {{ row.id.substring(0, 8) }}...</div>
          </template>
          <template #cell:cliente="{ row }">
            <div class="font-medium text-gray-900">{{ row.cliente }}</div>
            <div class="text-xs text-gray-500">{{ row.email }}</div>
          </template>
          <template #cell:destino="{ row }">
            <div class="font-medium text-gray-900">{{ row.destino }}</div>
            <div class="text-xs text-gray-500">{{ row.duracion }}</div>
          </template>
          <template #cell:segmentos="{ row }">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 text-sm font-semibold"
              >
                {{ row.segmentos }}
              </span>
              <span class="text-sm text-gray-600">
                {{ row.segmentos === 1 ? 'segmento' : 'segmentos' }}
              </span>
            </div>
          </template>
          <template #cell:segmento="{ row }">
            <span
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              :class="getEstadoClass(row.estado)"
            >
              {{ getEstadoDisplayName(row.estado) }}
            </span>
          </template>
          <template #cell:fecha="{ row }">
            <div class="text-sm text-gray-900">{{ formatDate(row.fecha) }}</div>
          </template>
        </DataTable>
      </div>

      <!-- Modal para ver detalles de cotización -->
      <Modal v-model="showDetailModal" max-width="3xl" @close="closeDetailModal">
        <template #header>
          <div class="flex items-center justify-between w-full gap-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <FileText class="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ cotizacionSeleccionada?.nombre || 'Detalle de Cotización' }}
                </h3>
                <p class="text-sm text-gray-600">Información completa de la cotización</p>
              </div>
            </div>
            <button
              type="button"
              @click="closeDetailModal"
              class="ml-auto text-gray-500 hover:text-gray-700 text-2xl font-light leading-none"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </template>

        <div v-if="cotizacionSeleccionada" class="space-y-6">
          <!-- Información General -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Estado -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <FileText class="w-4 h-4 text-orange-600" />
                <span class="text-xs font-medium text-gray-600">Estado</span>
              </div>
              <span
                class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                :class="getEstadoClass(cotizacionSeleccionada.estado)"
              >
                {{ getEstadoDisplayName(cotizacionSeleccionada.estado) }}
              </span>
            </div>

            <!-- Fecha de Creación -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <Calendar class="w-4 h-4 text-orange-600" />
                <span class="text-xs font-medium text-gray-600">Fecha de Creación</span>
              </div>
              <p class="text-sm font-semibold text-gray-900">
                {{ formatDate(cotizacionSeleccionada.created_at) }}
              </p>
            </div>
          </div>

          <!-- Información del Cliente -->
          <div v-if="cotizacionSeleccionada.viajero" class="bg-blue-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User class="w-4 h-4 text-orange-600" />
              Información del Cliente
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span class="text-xs text-gray-600">Nombre Completo</span>
                <p class="text-sm font-medium text-gray-900">
                  {{ cotizacionSeleccionada.viajero.nombre }}
                  {{ cotizacionSeleccionada.viajero.apellido }}
                </p>
              </div>
              <div>
                <span class="text-xs text-gray-600">Email</span>
                <p class="text-sm font-medium text-gray-900">
                  {{ cotizacionSeleccionada.viajero.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Resumen del Viaje -->
          <div class="bg-orange-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin class="w-4 h-4 text-orange-600" />
              Resumen del Viaje
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span class="text-xs text-gray-600">Destino</span>
                <p class="text-sm font-semibold text-gray-900">
                  {{ obtenerDestinoDesdeSegmentos(cotizacionSeleccionada.segmentos || []) }}
                </p>
              </div>
              <div>
                <span class="text-xs text-gray-600">Duración</span>
                <p class="text-sm font-semibold text-gray-900">
                  {{ calcularDuracionViaje(cotizacionSeleccionada.segmentos || []) }}
                </p>
              </div>
              <div>
                <span class="text-xs text-gray-600">Total de Segmentos</span>
                <p class="text-sm font-semibold text-gray-900">
                  {{ cotizacionSeleccionada.segmentos?.length || 0 }} segmentos
                </p>
              </div>
            </div>
          </div>

          <!-- Lista de Segmentos -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Segmentos del Viaje</h4>
            <div
              v-if="cotizacionSeleccionada.segmentos && cotizacionSeleccionada.segmentos.length > 0"
              class="space-y-3"
            >
              <div
                v-for="(segmento, index) in cotizacionSeleccionada.segmentos"
                :key="segmento.id"
                class="border border-gray-200 rounded-lg p-4 bg-white hover:border-orange-300 transition-colors"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                    :class="
                      segmento.tipo === 'transporte'
                        ? 'bg-orange-100 text-orange-800'
                        : segmento.tipo === 'hospedaje'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-yellow-100 text-yellow-800'
                    "
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-md"
                        :class="
                          segmento.tipo === 'transporte'
                            ? 'bg-orange-100 text-orange-800'
                            : segmento.tipo === 'hospedaje'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-yellow-100 text-yellow-800'
                        "
                      >
                        {{ segmento.tipo.toUpperCase() }}
                      </span>
                      <span class="text-sm font-semibold text-gray-900">{{ segmento.nombre }}</span>
                    </div>
                    <div class="space-y-1 text-sm text-gray-600">
                      <div v-if="segmento.proveedor" class="flex items-center gap-2">
                        <span class="font-medium">Proveedor:</span>
                        <span>{{ segmento.proveedor }}</span>
                      </div>
                      <div v-if="segmento.fecha_inicio" class="flex items-center gap-2">
                        <Calendar class="w-3 h-3" />
                        <span>
                          {{ formatDate(segmento.fecha_inicio) }}
                          <span v-if="segmento.fecha_fin">
                            - {{ formatDate(segmento.fecha_fin) }}
                          </span>
                        </span>
                      </div>
                      <div
                        v-if="segmento.tipo === 'transporte' && segmento.segmento_transporte"
                        class="flex items-center gap-2"
                      >
                        <MapPin class="w-3 h-3" />
                        <span>
                          {{ segmento.segmento_transporte.origen || 'N/A' }} →
                          {{ segmento.segmento_transporte.destino || 'N/A' }}
                        </span>
                      </div>
                      <div v-if="segmento.observaciones" class="text-xs italic text-gray-500 mt-2">
                        {{ segmento.observaciones }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <p>No hay segmentos agregados a esta cotización</p>
            </div>
          </div>
        </div>
      </Modal>

      <!-- Modal para nueva cotización -->
      <Modal v-model="showForm" :max-width="'2xl'" title="" @close="closeForm">
        <!-- Transporte -->
        <TransporteForm
          v-if="selectedSegment === 'transporte'"
          :initial-data="editandoSegmento"
          :fecha-inicio-viaje="fechaInicioCotizacion"
          :fecha-fin-viaje="fechaFinCotizacion"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />

        <!-- Hospedaje -->
        <HospedajeForm
          v-else-if="selectedSegment === 'hospedaje'"
          :initial-data="editandoSegmento"
          :fecha-inicio-viaje="fechaInicioCotizacion"
          :fecha-fin-viaje="fechaFinCotizacion"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />

        <!-- Actividades -->
        <ActividadesForm
          v-else-if="selectedSegment === 'actividades'"
          :initial-data="editandoSegmento"
          :fecha-inicio-viaje="fechaInicioCotizacion"
          :fecha-fin-viaje="fechaFinCotizacion"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import draggable from 'vuedraggable'
import Modal from '@/components/ui/Modal.vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
import {
  TransporteForm,
  HospedajeForm,
  ActividadesForm,
  SegmentoCard,
} from '@/components/cotizaciones'
import {
  Plane,
  Home,
  Compass,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  User,
  MapPin,
  FileText,
} from 'lucide-vue-next'
import type { Cotizacion, Segmento } from '@/services/supabase'
import { cotizacionesService, type CotizacionWithSegmentos } from '@/services/cotizaciones.service'
import {
  segmentosService,
  type CreateSegmentoData,
  type SegmentoWithDetails,
} from '@/services/segmentos.service'
import type { ServiceResponse } from '@/services/base.service'

// Interface para el viajero en cotizaciones
interface ViajeroCotizacion {
  nombre?: string
  apellido?: string
  email?: string
}

// Tipos para formularios
// Interfaces de formularios definidas en componentes individuales

const showForm = ref(false)
const showDetailModal = ref(false)
const cotizacionSeleccionada = ref<CotizacionWithSegmentos | null>(null)
const selectedSegment = ref<string>('')
const search = ref('')
const tableLoading = ref(false)
const cotizacionActual = ref<Cotizacion | null>(null)
const segmentosAgregados = ref<Segmento[]>([])
const editandoSegmento = ref<Segmento | null>(null)

// Calcular rango de fechas desde los segmentos existentes (excluyendo el que se está editando)
const fechaInicioCotizacion = computed(() => {
  // Filtrar segmentos (excluir el que se está editando)
  const segmentosParaValidar = editandoSegmento.value
    ? segmentosAgregados.value.filter((s) => s.id !== editandoSegmento.value?.id)
    : segmentosAgregados.value

  if (segmentosParaValidar.length === 0) {
    return null // Si no hay segmentos (o solo el que se está editando), no hay restricción
  }

  // Obtener todas las fechas de inicio de los segmentos
  const fechasInicio = segmentosParaValidar
    .map((s) => s.fecha_inicio)
    .filter((f) => f)
    .sort()

  return fechasInicio.length > 0 ? fechasInicio[0] : null
})

const fechaFinCotizacion = computed(() => {
  // Filtrar segmentos (excluir el que se está editando)
  const segmentosParaValidar = editandoSegmento.value
    ? segmentosAgregados.value.filter((s) => s.id !== editandoSegmento.value?.id)
    : segmentosAgregados.value

  if (segmentosParaValidar.length === 0) {
    return null // Si no hay segmentos (o solo el que se está editando), no hay restricción
  }

  // Obtener todas las fechas de fin de los segmentos
  const fechasFin = segmentosParaValidar
    .map((s) => s.fecha_fin)
    .filter((f) => f)
    .sort()

  // Si hay fechas de fin, tomar la más tardía
  if (fechasFin.length > 0) {
    return fechasFin[fechasFin.length - 1]
  }

  // Si no hay fechas de fin, usar la fecha de inicio más tardía
  const fechasInicio = segmentosParaValidar
    .map((s) => s.fecha_inicio)
    .filter((f) => f)
    .sort()

  return fechasInicio.length > 0 ? fechasInicio[fechasInicio.length - 1] : null
})

// Columnas de la tabla de cotizaciones
const tableColumns: DataTableColumn[] = [
  { key: 'nombre', label: 'Cotización', width: '20%' },
  { key: 'cliente', label: 'Cliente', width: '20%' },
  { key: 'destino', label: 'Destino', width: '20%' },
  { key: 'segmentos', label: 'Segmentos', width: '15%' },
  { key: 'segmento', label: 'Estado', width: '15%' },
  { key: 'fecha', label: 'Fecha', width: '10%' },
]

// Definir tipo para las filas de cotización
interface CotizacionRow {
  id: string
  nombre: string
  viajero_id: string
  cliente: string
  email: string
  destino: string
  duracion: string
  segmentos: number
  segmento: string
  fecha: string
  presupuesto: number
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada'
}

// Datos de cotizaciones cargados desde Supabase
const allTableRows = ref<CotizacionRow[]>([])

// Filtrar filas basado en búsqueda
const tableRows = computed(() => {
  if (!search.value) return allTableRows.value
  const term = search.value.toLowerCase()
  return allTableRows.value.filter(
    (row) =>
      String(row.nombre).toLowerCase().includes(term) ||
      String(row.cliente).toLowerCase().includes(term) ||
      String(row.email).toLowerCase().includes(term) ||
      String(row.destino).toLowerCase().includes(term) ||
      String(row.duracion).toLowerCase().includes(term) ||
      String(getEstadoDisplayName(row.estado)).toLowerCase().includes(term),
  )
})

// Los segmentos ahora se ordenan mediante drag & drop, no por fecha
// segmentosAgregados ya contiene el orden correcto según el campo 'orden'

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

const handleFormSubmit = async (data: Record<string, unknown>) => {
  try {
    // console.log('📥 Datos recibidos del formulario:', data)

    // Crear cotización si no existe
    if (!cotizacionActual.value) {
      const result = await cotizacionesService.create({
        nombre: `Cotización ${new Date().toLocaleDateString('es-ES')}`,
        estado: 'borrador',
      })

      if (result.error || !result.data) {
        throw new Error(result.error || 'Error al crear cotización')
      }

      cotizacionActual.value = result.data
    }

    // Determinar el tipo de segmento basado en selectedSegment
    let tipoSegmento: 'transporte' | 'hospedaje' | 'actividad'
    if (selectedSegment.value === 'transporte') {
      tipoSegmento = 'transporte'
    } else if (selectedSegment.value === 'hospedaje') {
      tipoSegmento = 'hospedaje'
    } else {
      tipoSegmento = 'actividad'
    }

    // Calcular si es primer o último segmento
    const totalSegmentos = segmentosAgregados.value.length
    const nuevoOrden = editandoSegmento.value ? editandoSegmento.value.orden : totalSegmentos + 1

    // Lógica corregida:
    // - Si no hay segmentos, el nuevo es el primero Y el último
    // - Si ya hay segmentos, el nuevo es solo el último (no el primero)
    // - Al editar, mantener los valores actuales
    const esPrimerSegmento = !editandoSegmento.value && totalSegmentos === 0
    const esUltimoSegmento = !editandoSegmento.value // Siempre el nuevo segmento es el último

    // Preparar datos del segmento
    const segmentoData = {
      tipo: tipoSegmento,
      nombre: (data.nombre as string) || (data.proveedor as string) || '',
      proveedor: (data.proveedor as string) || (data.nombre as string) || '',
      fecha_inicio:
        (data.fechaInicial as string) ||
        (data.fechaEntrada as string) ||
        (data.fecha_inicio as string) ||
        '',
      fecha_fin:
        (data.fechaFinal as string) ||
        (data.fechaSalida as string) ||
        (data.fecha_fin as string) ||
        undefined,
      hora_inicio: (data.horaEntrada as string) || (data.horaInicio as string) || undefined,
      hora_fin: (data.horaSalida as string) || (data.hora_fin as string) || undefined,
      duracion: (data.duracion as string) || '',
      observaciones: (data.observaciones as string) || '',
      orden: nuevoOrden,
      es_primero: esPrimerSegmento,
      es_ultimo: esUltimoSegmento,
      cotizacion_id: cotizacionActual.value.id,
    }

    // console.log('📦 Datos del segmento preparados:', segmentoData)

    // Preparar datos específicos según el tipo
    const createData: CreateSegmentoData = {
      ...segmentoData,
    }

    if (tipoSegmento === 'transporte') {
      // Crear segmento de transporte simple
      createData.transporte = {
        tipo_transporte: ((data.tipo as string) || 'otro') as
          | 'aereo'
          | 'tren'
          | 'bus'
          | 'carro_privado'
          | 'uber'
          | 'otro',
        origen: (data.origen as string) || '',
        destino: (data.destino as string) || '',
        codigo_reserva: (data.codigoReserva as string) || undefined,
      }
    } else if (tipoSegmento === 'hospedaje') {
      createData.hospedaje = {
        tipo_hospedaje: ((data.tipo as string) || 'otro') as
          | 'hotel'
          | 'renta_privada'
          | 'airbnb'
          | 'otro',
      }
    } else if (tipoSegmento === 'actividad') {
      createData.actividad = {
        duracion_horas: (data.duracion_horas as number) ?? undefined,
      }
    }

    if (editandoSegmento.value) {
      // Actualizar segmento existente
      // console.log('📝 Actualizando segmento:', editandoSegmento.value.id)
      const result = (await segmentosService.update(
        editandoSegmento.value.id,
        createData,
      )) as ServiceResponse<SegmentoWithDetails>

      if (result.error) {
        throw new Error(result.error)
      }

      // Recargar segmentos
      await loadSegmentos()
      alert('Segmento actualizado correctamente')
    } else {
      // Crear nuevo segmento
      const result = (await segmentosService.create(
        createData,
      )) as ServiceResponse<SegmentoWithDetails>

      if (result.error || !result.data) {
        throw new Error(result.error || 'Error al crear segmento')
      }

      // El servicio ya actualiza automáticamente los marcadores de otros segmentos
      segmentosAgregados.value.push(result.data as Segmento)
      // console.log('✅ Segmento creado:', result.data)
      alert('Segmento agregado. Puedes agregar más o guardar la cotización completa.')
    }

    closeForm()
  } catch (error) {
    console.error('Error al guardar segmento:', error)
    alert('Error al guardar el segmento. Inténtalo de nuevo.')
  }
}

// Función para cargar segmentos de la cotización actual
const loadSegmentos = async () => {
  if (cotizacionActual.value) {
    try {
      const result = await cotizacionesService.getById(cotizacionActual.value.id)
      if (result.error || !result.data) {
        throw new Error(result.error || 'Error al cargar cotización')
      }
      segmentosAgregados.value = result.data.segmentos || []
    } catch (error) {
      console.error('Error al cargar segmentos:', error)
      alert('Error al cargar los segmentos')
    }
  }
}

const editarSegmento = (segmento: Segmento) => {
  editandoSegmento.value = segmento
  // Determinar qué tipo de segmento es para abrir el formulario correcto
  if (segmento.tipo === 'transporte') {
    selectedSegment.value = 'transporte'
  } else if (segmento.tipo === 'hospedaje') {
    selectedSegment.value = 'hospedaje'
  } else if (segmento.tipo === 'actividad') {
    selectedSegment.value = 'actividades'
  }
  showForm.value = true
}

const eliminarSegmento = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este segmento?')) {
    try {
      await segmentosService.delete(id)
      segmentosAgregados.value = segmentosAgregados.value.filter((s) => s.id !== id)
      alert('Segmento eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar segmento:', error)
      alert('Error al eliminar el segmento')
    }
  }
}

// Función para manejar el reordenamiento de segmentos
const onDragEnd = async () => {
  try {
    const totalSegmentos = segmentosAgregados.value.length

    if (totalSegmentos === 0) return

    // Actualizar orden de todos los segmentos según su nueva posición
    for (let index = 0; index < totalSegmentos; index++) {
      const segmento = segmentosAgregados.value[index]
      const nuevoOrden = index + 1

      // Actualizar el orden si cambió
      if (segmento.orden !== nuevoOrden) {
        await segmentosService.update(segmento.id, {
          orden: nuevoOrden,
        })

        // Actualizar localmente
        segmento.orden = nuevoOrden
      }
    }

    // Actualizar banderas de primero/último usando el método del servicio
    if (cotizacionActual.value) {
      const result = await segmentosService.actualizarBanderasDespuesReordenar(
        cotizacionActual.value.id,
        undefined,
      )

      if (result.error) {
        throw new Error(result.error)
      }

      // Recargar segmentos para obtener las banderas actualizadas
      await loadSegmentos()
    }
  } catch (error) {
    console.error('Error en drag & drop:', error)
    alert('Error al reordenar los segmentos')
    await loadSegmentos()
  }
}

const limpiarSegmentos = async () => {
  if (confirm('¿Estás seguro de eliminar todos los segmentos? Esta acción no se puede deshacer.')) {
    try {
      if (cotizacionActual.value) {
        // Eliminar todos los segmentos de la cotización
        for (const segmento of segmentosAgregados.value) {
          await segmentosService.delete(segmento.id)
        }
        segmentosAgregados.value = []
        // Opcionalmente, eliminar la cotización si no tiene segmentos
        await cotizacionesService.delete(cotizacionActual.value.id)
        cotizacionActual.value = null
      }
    } catch (error) {
      console.error('Error al limpiar segmentos:', error)
      alert('Error al limpiar los segmentos')
    }
  }
}

const guardarCotizacionCompleta = async () => {
  if (segmentosAgregados.value.length === 0) {
    alert('No hay segmentos para guardar')
    return
  }

  try {
    // La cotización ya está guardada, solo actualizar estado si es necesario
    if (cotizacionActual.value) {
      await cotizacionesService.update(cotizacionActual.value.id, {
        estado: 'enviada', // Cambiar estado cuando se "envía" la cotización
      })
    }

    alert(
      `Cotización guardada con ${segmentosAgregados.value.length} segmentos.\n\nEstado: Enviada\n\nPróximamente: Generación de PDF`,
    )

    // Limpiar después de guardar
    segmentosAgregados.value = []
    cotizacionActual.value = null

    // Recargar la tabla de cotizaciones
    await recargarCotizaciones()
  } catch (error) {
    console.error('Error al guardar cotización:', error)
    alert('Error al guardar la cotización')
  }
}

// Funciones auxiliares para la tabla
const getEstadoClass = (estado: string) => {
  switch (estado) {
    case 'borrador':
      return 'bg-gray-100 text-gray-800'
    case 'enviada':
      return 'bg-blue-100 text-blue-800'
    case 'aprobada':
      return 'bg-green-100 text-green-800'
    case 'rechazada':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getEstadoDisplayName = (estado: string) => {
  switch (estado) {
    case 'borrador':
      return 'Borrador'
    case 'enviada':
      return 'Enviada'
    case 'aprobada':
      return 'Aprobada'
    case 'rechazada':
      return 'Rechazada'
    default:
      return estado || 'Borrador'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const editCotizacion = async (row: CotizacionRow) => {
  try {
    // Cargar la cotización completa con segmentos
    const result = await cotizacionesService.getById(row.id)
    if (result.error || !result.data) {
      throw new Error(result.error || 'Error al cargar cotización')
    }
    cotizacionActual.value = result.data
    segmentosAgregados.value = result.data.segmentos || []

    // Abrir el formulario para editar (agregar un segmento mostrará el formulario)
    // Si no hay segmentos, abrir modal para agregar el primero
    if (!result.data.segmentos || result.data.segmentos.length === 0) {
      selectedSegment.value = 'transporte'
      showForm.value = true
    }
  } catch (error) {
    console.error('Error al cargar cotización:', error)
    alert('Error al cargar la cotización para edición')
  }
}

const verCotizacion = async (row: CotizacionRow) => {
  try {
    // Cargar la cotización completa con segmentos
    const result = await cotizacionesService.getById(row.id)
    if (result.error || !result.data) {
      throw new Error(result.error || 'Error al cargar cotización')
    }

    cotizacionSeleccionada.value = result.data
    showDetailModal.value = true
  } catch (error) {
    console.error('Error al ver cotización:', error)
    alert('Error al cargar los detalles de la cotización')
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  cotizacionSeleccionada.value = null
}

const eliminarCotizacion = async (row: CotizacionRow) => {
  if (
    !confirm(
      `¿Estás seguro de eliminar la cotización "${row.nombre}"?\n\n` +
        `Esta acción eliminará la cotización y todos sus segmentos.\n` +
        `Esta acción no se puede deshacer.`,
    )
  ) {
    return
  }

  try {
    // console.log('🗑️ Eliminando cotización:', row.id)

    // Eliminar la cotización (los segmentos se eliminarán en cascada si está configurado)
    await cotizacionesService.delete(row.id)

    // console.log('✅ Cotización eliminada')
    alert('Cotización eliminada correctamente')

    // Recargar la tabla
    await recargarCotizaciones()
  } catch (error) {
    console.error('❌ Error al eliminar cotización:', error)
    alert('Error al eliminar la cotización. Inténtalo de nuevo.')
  }
}

// Función auxiliar para calcular la duración del viaje en días
const calcularDuracionViaje = (segmentos: Segmento[]): string => {
  if (!segmentos || segmentos.length === 0) {
    return 'Sin fecha'
  }

  // Obtener todas las fechas de inicio y fin
  const fechasInicio = segmentos
    .map((s) => s.fecha_inicio)
    .filter((f): f is string => f !== undefined && f !== null)
    .sort()

  const fechasFin = segmentos
    .map((s) => s.fecha_fin)
    .filter((f): f is string => f !== undefined && f !== null)
    .sort()

  if (fechasInicio.length === 0) {
    return 'Sin fecha'
  }

  const fechaInicio = new Date(fechasInicio[0])
  const fechaFin = fechasFin.length > 0 ? new Date(fechasFin[fechasFin.length - 1]) : fechaInicio

  // Calcular diferencia en días
  const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 para incluir ambos días

  if (diffDays === 1) {
    return '1 día'
  }

  return `${diffDays} días`
}

// Función auxiliar para obtener el destino desde los segmentos
const obtenerDestinoDesdeSegmentos = (segmentos: Segmento[]): string => {
  if (!segmentos || segmentos.length === 0) {
    return 'Sin destino'
  }

  // Buscar el último segmento de transporte con destino
  const segmentosTransporte = segmentos
    .filter((s) => s.tipo === 'transporte' && s.segmento_transporte?.destino)
    .sort((a, b) => (b.orden || 0) - (a.orden || 0))

  if (segmentosTransporte.length > 0) {
    const segmentoTransporte = segmentosTransporte[0].segmento_transporte
    if (segmentoTransporte?.destino) {
      const destino = segmentoTransporte.destino
      // Extraer solo el nombre de la ciudad si tiene formato "Ciudad (COD)"
      const match = destino.match(/^(.+?)\s*\(/)
      return match ? match[1] : destino
    }
  }

  // Si no hay segmentos de transporte, usar el nombre del último segmento
  const ultimoSegmento = segmentos.sort((a, b) => (b.orden || 0) - (a.orden || 0))[0]
  return ultimoSegmento?.nombre || 'Sin destino'
}

// Función para recargar cotizaciones desde Supabase
const recargarCotizaciones = async () => {
  try {
    tableLoading.value = true
    const result = await cotizacionesService.list()

    if (result.error) {
      throw new Error(result.error)
    }

    // Transformar cotizaciones a formato de tabla
    allTableRows.value = (result.data || []).map((cot) => {
      // Obtener información del cliente/viajero
      const viajero = cot.viajero as ViajeroCotizacion | null
      const nombreCliente = viajero
        ? `${viajero.nombre || ''} ${viajero.apellido || ''}`.trim() || 'Sin nombre'
        : 'Sin cliente asignado'
      const emailCliente = viajero?.email || 'Sin email'

      // Obtener información de los segmentos
      const segmentos = (cot.segmentos || []) as Segmento[]
      const destino = obtenerDestinoDesdeSegmentos(segmentos)
      const duracion = calcularDuracionViaje(segmentos)
      const cantidadSegmentos = segmentos.length

      return {
        id: cot.id,
        nombre: cot.nombre,
        viajero_id: cot.viajero_id || '',
        cliente: nombreCliente,
        email: emailCliente,
        destino: destino,
        duracion: duracion,
        segmentos: cantidadSegmentos,
        segmento: cot.estado || 'borrador', // Se usa para mostrar el estado
        fecha: cot.created_at,
        presupuesto: 0, // No hay campo de precio en los segmentos actualmente
        estado: cot.estado,
      }
    })
  } catch (error) {
    console.error('Error al cargar cotizaciones:', error)
    alert('Error al cargar las cotizaciones desde la base de datos')
  } finally {
    tableLoading.value = false
  }
}

// Cargar cotizaciones al montar el componente
onMounted(() => {
  recargarCotizaciones()
})
</script>
