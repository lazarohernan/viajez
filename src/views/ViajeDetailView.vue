<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="$router.go(-1)"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ viaje?.nombre }}</h1>
              <p class="text-gray-600">{{ viaje?.descripcion }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
              :class="getEstadoClass(viaje?.estado)"
            >
              {{ getEstadoLabel(viaje?.estado) }}
            </span>
            <button
              @click="showAddSegment = true"
              class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus class="w-4 h-4 mr-2" />
              Agregar Segmento
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="max-w-[1600px] mx-auto px-6 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Segmentos</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">{{ segmentos.length }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <MapPin class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Viajeros</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">{{ viajeros.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <User class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Progreso</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">
                {{ viaje?.progreso_porcentaje || 0 }}%
              </p>
            </div>
            <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-gray-500">Duración</p>
              <p class="text-2xl font-semibold text-gray-900 mt-1">{{ calcularDuracion() }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Calendar class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-[1600px] mx-auto px-6 pb-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Columna izquierda: Información del viaje -->
        <div class="lg:col-span-1 space-y-4">
          <!-- Información básica -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar class="w-4 h-4 text-orange-600" />
              Información del Viaje
            </h3>
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                <p class="text-gray-900">{{ formatDate(viaje?.fecha_inicio) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Fecha de Fin</label>
                <p class="text-gray-900">{{ formatDate(viaje?.fecha_fin) || 'No definida' }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Progreso</label>
                <div class="mt-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${viaje?.progreso_porcentaje || 0}%` }"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ viaje?.progreso_porcentaje || 0 }}% completado
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Viajeros asignados -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User class="w-4 h-4 text-orange-600" />
              Viajeros Asignados
            </h3>
            <div v-if="viajeros.length === 0" class="text-center py-4 text-gray-500">
              No hay viajeros asignados
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="viajero in viajeros"
                :key="viajero.id"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <User class="w-4 h-4 text-orange-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900">
                    {{ viajero.nombre }} {{ viajero.apellido }}
                  </p>
                  <p class="text-sm text-gray-500">{{ viajero.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna derecha: Segmentos del viaje -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                <MapPin class="w-4 h-4 text-orange-600" />
                Segmentos del Viaje
              </h3>
              <div class="flex items-center gap-3">
                <span class="text-sm text-gray-500"
                  >{{ segmentos.length }} segmento{{ segmentos.length !== 1 ? 's' : '' }}</span
                >
                <button
                  @click="showAddSegment = true"
                  class="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus class="w-4 h-4 mr-1.5" />
                  Agregar
                </button>
              </div>
            </div>

            <!-- Lista de segmentos -->
            <div v-if="segmentos.length === 0" class="text-center py-12">
              <div
                class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <MapPin class="w-8 h-8 text-orange-600" />
              </div>
              <h4 class="text-lg font-medium text-gray-900 mb-2">No hay segmentos agregados</h4>
              <p class="text-gray-600 mb-4">
                Agrega segmentos para organizar el itinerario del viaje
              </p>
              <button
                @click="showAddSegment = true"
                class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus class="w-4 h-4 mr-2" />
                Agregar Primer Segmento
              </button>
            </div>

            <!-- Lista de segmentos ordenados por fecha -->
            <div v-else class="space-y-3">
              <div
                v-for="segmento in segmentosOrdenados"
                :key="segmento.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-200 transition-all"
              >
                <div class="flex items-start justify-between gap-4">
                  <!-- Información del segmento -->
                  <div class="flex items-start gap-3 flex-1">
                    <!-- Icono según tipo -->
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      :class="getSegmentoIconBg(segmento.tipo)"
                    >
                      <Plane
                        v-if="segmento.tipo === 'transporte'"
                        class="w-5 h-5 text-orange-600"
                      />
                      <Home
                        v-else-if="segmento.tipo === 'hospedaje'"
                        class="w-5 h-5 text-orange-600"
                      />
                      <Compass v-else class="w-5 h-5 text-orange-600" />
                    </div>

                    <!-- Detalles -->
                    <div class="flex-1 min-w-0">
                      <!-- Tipo y nombre -->
                      <div class="flex items-center gap-2 mb-2">
                        <span
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                          :class="getTipoBadgeClass(segmento.tipo)"
                        >
                          {{ segmento.tipo }}
                        </span>
                        <span
                          v-if="
                            segmento.tipo === 'transporte' &&
                            segmento.segmento_transporte?.tiene_retorno === false
                          "
                          class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                          Solo ida
                        </span>
                      </div>

                      <h4 class="font-semibold text-gray-900 mb-1">{{ segmento.nombre }}</h4>
                      <p class="text-sm text-gray-600 mb-2">{{ segmento.proveedor }}</p>

                      <!-- Fechas -->
                      <div class="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div class="flex items-center gap-1">
                          <Calendar class="w-4 h-4" />
                          <span>{{ formatFechas(segmento) }}</span>
                        </div>
                        <div v-if="segmento.duracion" class="flex items-center gap-1">
                          <Clock class="w-4 h-4" />
                          <span>{{ segmento.duracion }}</span>
                        </div>
                      </div>

                      <!-- Observaciones -->
                      <p v-if="segmento.observaciones" class="text-sm text-gray-600 italic">
                        {{ segmento.observaciones }}
                      </p>

                      <!-- Documentos adjuntos -->
                      <div v-if="segmentoDocumentos[segmento.id]?.length > 0" class="mt-2">
                        <p class="text-xs text-gray-500 mb-1">
                          {{ segmentoDocumentos[segmento.id].length }} documento(s) adjunto(s)
                        </p>
                        <div class="flex flex-wrap gap-1">
                          <span
                            v-for="doc in segmentoDocumentos[segmento.id].slice(0, 3)"
                            :key="doc.id"
                            class="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                          >
                            <FileText class="w-3 h-3 mr-1" />
                            {{ doc.nombre_archivo.split('.').pop()?.toUpperCase() }}
                          </span>
                          <span
                            v-if="segmentoDocumentos[segmento.id].length > 3"
                            class="inline-flex items-center px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded"
                          >
                            +{{ segmentoDocumentos[segmento.id].length - 3 }} más
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Acciones -->
                  <div class="flex flex-col gap-2 flex-shrink-0">
                    <button
                      @click="editarSegmento(segmento)"
                      class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Editar segmento"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      @click="gestionarDocumentos(segmento)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Gestionar documentos"
                    >
                      <FileText class="w-4 h-4" />
                    </button>
                    <button
                      @click="eliminarSegmento(segmento.id)"
                      class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar segmento"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar segmento -->
    <Modal
      v-model="showAddSegment"
      :max-width="'2xl'"
      :title="editingSegment ? 'Editar Segmento' : 'Agregar Segmento'"
    >
      <!-- Formulario de segmento -->
      <div class="space-y-6">
        <!-- Selector de tipo de segmento -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Tipo de Segmento</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              type="button"
              @click="selectedSegmentType = 'transporte'"
              :class="[
                'p-4 border-2 rounded-lg text-center transition-all',
                selectedSegmentType === 'transporte'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <Plane class="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span class="text-sm font-medium">Transporte</span>
            </button>
            <button
              type="button"
              @click="selectedSegmentType = 'hospedaje'"
              :class="[
                'p-4 border-2 rounded-lg text-center transition-all',
                selectedSegmentType === 'hospedaje'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <Home class="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span class="text-sm font-medium">Hospedaje</span>
            </button>
            <button
              type="button"
              @click="selectedSegmentType = 'actividad'"
              :class="[
                'p-4 border-2 rounded-lg text-center transition-all',
                selectedSegmentType === 'actividad'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              <Compass class="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span class="text-sm font-medium">Actividad</span>
            </button>
          </div>
        </div>

        <!-- Formulario según tipo -->
        <TransporteForm
          v-if="selectedSegmentType === 'transporte'"
          ref="transporteFormRef"
          :initial-data="editingSegment"
          @submit="handleSegmentSubmit"
          @cancel="closeSegmentModal"
        />
        <HospedajeForm
          v-else-if="selectedSegmentType === 'hospedaje'"
          ref="hospedajeFormRef"
          :initial-data="editingSegment"
          @submit="handleSegmentSubmit"
          @cancel="closeSegmentModal"
        />
        <ActividadesForm
          v-else-if="selectedSegmentType === 'actividad'"
          ref="actividadesFormRef"
          :initial-data="editingSegment"
          @submit="handleSegmentSubmit"
          @cancel="closeSegmentModal"
        />
      </div>
    </Modal>

    <!-- Modal para gestionar documentos -->
    <Modal v-model="showDocumentosModal" :max-width="'3xl'" title="Gestionar Documentos">
      <div v-if="selectedSegmentForDocs">
        <DocumentosSegmento :segmento-id="selectedSegmentForDocs.id" />
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  Plus,
  User,
  MapPin,
  Plane,
  Home,
  Compass,
  Calendar,
  Clock,
  Pencil,
  FileText,
  Trash2,
} from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import { TransporteForm, HospedajeForm, ActividadesForm } from '@/components/cotizaciones'
import DocumentosSegmento from '@/components/DocumentosSegmento.vue'
import {
  viajesService,
  segmentosService,
  documentosService,
  supabase,
  type Viaje,
  type Segmento,
  type Viajeroz,
  type Documento,
} from '@/services/supabase'

const route = useRoute()

// Tipos para formularios
// Interfaces de formularios definidas en componentes individuales

// Variables reactivas
const viajeId = ref(route.params.id as string)
const viaje = ref<Viaje | null>(null)
const segmentos = ref<Segmento[]>([])
const viajeros = ref<Viajeroz[]>([])
const segmentoDocumentos = ref<Record<string, Documento[]>>({})

// Modales y formularios
const showAddSegment = ref(false)
const selectedSegmentType = ref<'transporte' | 'hospedaje' | 'actividad'>('transporte')
const editingSegment = ref<Segmento | null>(null)
const showDocumentosModal = ref(false)
const selectedSegmentForDocs = ref<Segmento | null>(null)

// Refs para formularios
const transporteFormRef = ref()
const hospedajeFormRef = ref()
const actividadesFormRef = ref()

// Cargar datos al montar
onMounted(async () => {
  await loadViaje()
})

// Funciones de carga de datos
const loadViaje = async () => {
  try {
    if (!viajeId.value) return

    // Cargar viaje con segmentos
    const viajeData = await viajesService.getById(viajeId.value)
    viaje.value = viajeData
    segmentos.value = viajeData.segmentos

    // Cargar viajeros asignados
    await loadViajeros()

    // Cargar documentos por segmento
    await loadDocumentosSegmentos()
  } catch (error) {
    console.error('Error al cargar viaje:', error)
    alert('Error al cargar el viaje')
  }
}

const loadViajeros = async () => {
  try {
    if (!viaje.value) return

    // Obtener IDs de viajeros del viaje
    const { data: viajeViajeroz, error } = await supabase
      .from('viaje_viajeroz')
      .select('viajero_id')
      .eq('viaje_id', viaje.value.id)

    if (error) throw error

    if (viajeViajeroz && viajeViajeroz.length > 0) {
      const viajeroIds = viajeViajeroz.map((vv) => vv.viajero_id)

      // Cargar datos de viajeros
      const { data: viajerosData, error: viajerosError } = await supabase
        .from('viajeroz')
        .select('*')
        .in('id', viajeroIds)

      if (viajerosError) throw viajerosError
      viajeros.value = viajerosData || []
    }
  } catch (error) {
    console.error('Error al cargar viajeros:', error)
  }
}

const loadDocumentosSegmentos = async () => {
  try {
    const documentosPorSegmento: Record<string, Documento[]> = {}

    for (const segmento of segmentos.value) {
      const documentos = await documentosService.getBySegmento(segmento.id)
      documentosPorSegmento[segmento.id] = documentos
    }

    segmentoDocumentos.value = documentosPorSegmento
  } catch (error) {
    console.error('Error al cargar documentos:', error)
  }
}

// Computed para segmentos ordenados
const segmentosOrdenados = computed(() => {
  return [...segmentos.value].sort((a, b) => {
    const fechaA = a.fecha_inicio || ''
    const fechaB = b.fecha_inicio || ''
    const horaA = a.hora_inicio || ''
    const horaB = b.hora_inicio || ''

    const comparacionFecha = fechaA.localeCompare(fechaB)
    if (comparacionFecha !== 0) return comparacionFecha

    return horaA.localeCompare(horaB)
  })
})

// Funciones para segmentos
const editarSegmento = (segmento: Segmento) => {
  editingSegment.value = segmento
  selectedSegmentType.value = segmento.tipo
  showAddSegment.value = true
}

const eliminarSegmento = async (segmentoId: string) => {
  if (!confirm('¿Estás seguro de eliminar este segmento? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    await segmentosService.delete(segmentoId)
    await loadViaje()
    alert('Segmento eliminado correctamente')
  } catch (error) {
    console.error('Error al eliminar segmento:', error)
    alert('Error al eliminar el segmento')
  }
}

const gestionarDocumentos = (segmento: Segmento) => {
  selectedSegmentForDocs.value = segmento
  showDocumentosModal.value = true
}

const handleSegmentSubmit = async (data: Record<string, unknown>) => {
  try {
    // Preparar datos del segmento
    const segmentoBase = {
      tipo: selectedSegmentType.value,
      nombre: (data.nombre as string) || (data.proveedor as string) || '',
      proveedor: (data.proveedor as string) || '',
      fecha_inicio:
        (data.fechaInicial as string) ||
        (data.fechaEntrada as string) ||
        (data.fecha_inicio as string) ||
        '',
      fecha_fin: (data.fechaFinal as string) || (data.fechaSalida as string) || undefined,
      hora_inicio: (data.horaSalida as string) || (data.horaInicio as string) || undefined,
      hora_fin: (data.horaEntrada as string) || undefined,
      duracion: (data.duracion as string) || '',
      observaciones: (data.observaciones as string) || '',
      orden: segmentos.value.length + 1,
      viaje_id: viajeId.value,
    }

    if (editingSegment.value) {
      // Actualizar segmento existente
      await segmentosService.update(editingSegment.value.id, segmentoBase)
      alert('Segmento actualizado correctamente')
    } else {
      // Crear nuevo segmento
      if (selectedSegmentType.value === 'transporte') {
        await segmentosService.createTransporte(segmentoBase, {
          tipo_transporte: ((data.tipo as string) || 'otro') as
            | 'aereo'
            | 'tren'
            | 'bus'
            | 'carro_privado'
            | 'uber'
            | 'otro',
          tiene_retorno: data.tieneRetorno !== false,
          origen: (data.origen as string) || '',
          destino: (data.destino as string) || '',
        })
      } else if (selectedSegmentType.value === 'hospedaje') {
        await segmentosService.createHospedaje(segmentoBase, {
          tipo_hospedaje: ((data.tipo as string) || 'otro') as
            | 'hotel'
            | 'renta_privada'
            | 'airbnb'
            | 'otro',
          numero_habitaciones: (data.numero_habitaciones as number) || undefined,
        })
      } else {
        await segmentosService.createActividad(segmentoBase, {
          duracion_horas: (data.duracion_horas as number) || undefined,
        })
      }

      alert('Segmento agregado correctamente')
    }

    await loadViaje()
    closeSegmentModal()
  } catch (error) {
    console.error('Error al guardar segmento:', error)
    alert('Error al guardar el segmento')
  }
}

const closeSegmentModal = () => {
  showAddSegment.value = false
  editingSegment.value = null
  selectedSegmentType.value = 'transporte'
}

// Funciones de utilidad
const getEstadoClass = (estado?: string) => {
  switch (estado) {
    case 'por_iniciar':
      return 'bg-amber-100 text-amber-800'
    case 'en_curso':
      return 'bg-orange-100 text-orange-800'
    case 'finalizado':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getEstadoLabel = (estado?: string) => {
  switch (estado) {
    case 'por_iniciar':
      return 'Por Iniciar'
    case 'en_curso':
      return 'En Curso'
    case 'finalizado':
      return 'Finalizado'
    default:
      return 'Desconocido'
  }
}

const getSegmentoIconBg = (tipo: string) => {
  switch (tipo) {
    case 'transporte':
      return 'bg-sky-50'
    case 'hospedaje':
      return 'bg-teal-50'
    case 'actividad':
      return 'bg-rose-50'
    default:
      return 'bg-gray-50'
  }
}

const getTipoBadgeClass = (tipo: string) => {
  switch (tipo) {
    case 'transporte':
      return 'bg-sky-100 text-sky-800'
    case 'hospedaje':
      return 'bg-teal-100 text-teal-800'
    case 'actividad':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

const formatFechas = (segmento: Segmento) => {
  if (segmento.fecha_inicio && segmento.fecha_fin) {
    return `${formatDate(segmento.fecha_inicio)} - ${formatDate(segmento.fecha_fin)}`
  }
  return formatDate(segmento.fecha_inicio) || 'Sin fecha'
}

const calcularDuracion = () => {
  if (!viaje.value?.fecha_inicio || !viaje.value?.fecha_fin) {
    return 'N/A'
  }

  try {
    const inicio = new Date(viaje.value.fecha_inicio)
    const fin = new Date(viaje.value.fecha_fin)
    const diffTime = Math.abs(fin.getTime() - inicio.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '1 día'
    if (diffDays === 1) return '1 día'
    return `${diffDays} días`
  } catch (error) {
    return 'N/A'
  }
}
</script>
