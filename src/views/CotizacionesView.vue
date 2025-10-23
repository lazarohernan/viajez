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
            <div class="flex items-center justify-center gap-2">
              <button
                @click="verCotizacion(row)"
                class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
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
          :initial-data="editandoSegmento"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />

        <!-- Hospedaje -->
        <HospedajeForm
          v-else-if="selectedSegment === 'hospedaje'"
          :initial-data="editandoSegmento"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />

        <!-- Actividades -->
        <ActividadesForm
          v-else-if="selectedSegment === 'actividades'"
          :initial-data="editandoSegmento"
          @submit="handleFormSubmit"
          @cancel="closeForm"
        />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
import {
  TransporteForm,
  HospedajeForm,
  ActividadesForm,
  SegmentoCard,
} from '@/components/cotizaciones'
import { Plane, Home, Compass, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { cotizacionesService, type Cotizacion, type Segmento } from '@/services/supabase'
import {
  segmentosService,
  type CreateSegmentoData,
  type SegmentoWithDetails,
} from '@/services/segmentos.service'
import type { ServiceResponse } from '@/services/base.service'

// Tipos para formularios
// Interfaces de formularios definidas en componentes individuales

const showForm = ref(false)
const selectedSegment = ref<string>('')
const search = ref('')
const tableLoading = ref(false)
const cotizacionActual = ref<Cotizacion | null>(null)
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
  id: string
  nombre: string
  viajero_id: string
  cliente: string
  email: string
  destino: string
  duracion: string
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
      String(row.cliente).toLowerCase().includes(term) ||
      String(row.destino).toLowerCase().includes(term) ||
      String(row.segmento).toLowerCase().includes(term),
  )
})

// Computed: segmentos ordenados por fecha
const segmentosOrdenados = computed(() => {
  return [...segmentosAgregados.value].sort((a, b) => {
    const fechaA = a.fecha_inicio || ''
    const fechaB = b.fecha_inicio || ''
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

const handleFormSubmit = async (data: Record<string, unknown>) => {
  try {
    console.log('📥 Datos recibidos del formulario:', data)

    // Crear cotización si no existe
    if (!cotizacionActual.value) {
      cotizacionActual.value = await cotizacionesService.create({
        nombre: `Cotización ${new Date().toLocaleDateString('es-ES')}`,
        estado: 'borrador',
      })
      console.log('✅ Cotización creada:', cotizacionActual.value)
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
      hora_inicio: (data.horaSalida as string) || (data.horaInicio as string) || undefined,
      hora_fin: (data.horaEntrada as string) || (data.hora_fin as string) || undefined,
      duracion: (data.duracion as string) || '',
      observaciones: (data.observaciones as string) || '',
      orden: segmentosAgregados.value.length + 1,
      cotizacion_id: cotizacionActual.value.id,
    }

    console.log('📦 Datos del segmento preparados:', segmentoData)

    // Preparar datos específicos según el tipo
    const createData: CreateSegmentoData = {
      ...segmentoData,
    }

    if (tipoSegmento === 'transporte') {
      createData.transporte = {
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
      console.log('📝 Actualizando segmento:', editandoSegmento.value.id)
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
      console.log('✨ Creando nuevo segmento')
      const result = (await segmentosService.create(
        createData,
      )) as ServiceResponse<SegmentoWithDetails>

      if (result.error || !result.data) {
        throw new Error(result.error || 'Error al crear segmento')
      }

      segmentosAgregados.value.push(result.data as Segmento)
      console.log('✅ Segmento creado:', result.data)
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
      const cotizacion = await cotizacionesService.getById(cotizacionActual.value.id)
      segmentosAgregados.value = cotizacion.segmentos || []
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

const editCotizacion = async (row: CotizacionRow) => {
  try {
    // Cargar la cotización completa con segmentos
    const cotizacion = await cotizacionesService.getById(row.id)
    cotizacionActual.value = cotizacion
    segmentosAgregados.value = cotizacion.segmentos || []

    console.log('Cotización cargada para edición:', cotizacion)
    alert(`Cotización "${cotizacion.nombre}" cargada para edición`)
  } catch (error) {
    console.error('Error al cargar cotización:', error)
    alert('Error al cargar la cotización para edición')
  }
}

const verCotizacion = async (row: CotizacionRow) => {
  try {
    // Cargar la cotización completa con segmentos
    const cotizacion = await cotizacionesService.getById(row.id)

    const segmentosInfo =
      cotizacion.segmentos
        ?.map((s, i) => `${i + 1}. ${s.tipo.toUpperCase()}: ${s.nombre}`)
        .join('\n') || 'Sin segmentos'

    alert(
      `📋 Cotización: ${cotizacion.nombre}\n` +
        `📅 Fecha: ${formatDate(cotizacion.created_at)}\n` +
        `📊 Estado: ${cotizacion.estado}\n` +
        `\n🎯 Segmentos (${cotizacion.segmentos?.length || 0}):\n${segmentosInfo}`,
    )
  } catch (error) {
    console.error('Error al ver cotización:', error)
    alert('Error al cargar los detalles de la cotización')
  }
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
    console.log('🗑️ Eliminando cotización:', row.id)

    // Eliminar la cotización (los segmentos se eliminarán en cascada si está configurado)
    await cotizacionesService.delete(row.id)

    console.log('✅ Cotización eliminada')
    alert('Cotización eliminada correctamente')

    // Recargar la tabla
    await recargarCotizaciones()
  } catch (error) {
    console.error('❌ Error al eliminar cotización:', error)
    alert('Error al eliminar la cotización. Inténtalo de nuevo.')
  }
}

// Función para recargar cotizaciones desde Supabase
const recargarCotizaciones = async () => {
  try {
    tableLoading.value = true
    const cotizaciones = await cotizacionesService.list()

    // Transformar cotizaciones a formato de tabla
    allTableRows.value = cotizaciones.map((cot) => ({
      id: cot.id,
      nombre: cot.nombre,
      viajero_id: cot.viajero_id || '',
      cliente: 'Cliente', // TODO: Obtener del viajero
      email: 'email@example.com', // TODO: Obtener del viajero
      destino: 'Destino', // TODO: Calcular desde segmentos
      duracion: '0 días', // TODO: Calcular desde segmentos
      segmento: cot.estado || 'borrador',
      fecha: cot.created_at,
      presupuesto: 0, // TODO: Calcular desde segmentos
      estado: cot.estado,
    }))
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
