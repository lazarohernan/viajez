<template>
  <div>
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <MapPin class="w-4 h-4 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Viajes Activos</h3>
          </div>
          <p class="text-sm text-gray-600 ml-10">Viajes en curso y próximos a iniciar</p>
        </div>
        <button
          type="button"
          class="text-sm text-orange-600 hover:text-orange-700 font-medium"
          @click="$emit('verTodos')"
        >
          Ver todos
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-600 text-sm">{{ error }}</p>
        <button
          @click="fetchViajesEnCurso"
          class="mt-2 text-sm text-orange-600 hover:text-orange-700"
        >
          Reintentar
        </button>
      </div>

      <div v-else-if="viajes.length === 0" class="text-center py-8">
        <p class="text-gray-500 text-sm">No hay viajes en curso actualmente.</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="viaje in viajes"
          :key="viaje.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          @click="abrirModal(viaje)"
        >
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin class="w-4 h-4 text-orange-600" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 text-sm truncate">{{ viaje.nombre }}</h4>
                <p class="text-xs text-gray-600 truncate">{{ viaje.destino }}</p>
              </div>
            </div>

            <!-- Información del progreso -->
            <div class="mt-3 flex items-center gap-4 flex-wrap">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-orange-600" />
                <span class="text-sm text-gray-600">{{ formatDate(viaje.fecha_inicio) }}</span>
              </div>
              <!-- Tiempo para que inicie (solo para viajes por iniciar) -->
              <div v-if="viaje.estado === 'por_iniciar'" class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-amber-600" />
                <span class="text-sm text-amber-700 font-medium">
                  {{ calcularDiasParaIniciar(viaje.fecha_inicio) }}
                </span>
              </div>
              <!-- Tiempo para que finalice -->
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-orange-600" />
                <span class="text-sm text-gray-600">
                  {{ calcularDiasRestantes(viaje.fecha_fin, viaje.estado) }}
                </span>
              </div>
            </div>

            <!-- Segmentos del viaje -->
            <div v-if="viaje.total_segmentos > 0" class="mt-3 space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-700">
                  Segmentos ({{ viaje.total_segmentos }})
                </span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <div
                  v-for="(segmento, index) in viaje.segmentos"
                  :key="index"
                  class="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all"
                  :class="getSegmentoClasses(segmento)"
                  :title="`${segmento.nombre} - ${segmento.porcentaje}%`"
                >
                  <span>{{ getSegmentoIcon(segmento.tipo, segmento.subtipo) }}</span>
                  <span class="max-w-[100px] truncate">{{ segmento.nombre }}</span>
                  <span class="font-semibold ml-0.5">{{ segmento.porcentaje }}%</span>
                </div>
              </div>
            </div>

            <!-- Barra de progreso -->
            <div class="mt-2">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progreso</span>
                <span>{{ viaje.progreso_porcentaje }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: viaje.progreso_porcentaje + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div class="ml-4">
            <span
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              :class="getEstadoClass(viaje.estado)"
            >
              {{ formatEstado(viaje.estado) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalle del Viaje -->
    <Modal v-model="showModal" :max-width="'3xl'" title="">
      <div v-if="viajeSeleccionado" class="space-y-6">
        <!-- Header -->
        <div class="text-center">
          <div
            class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MapPin class="w-8 h-8 text-orange-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ viajeSeleccionado.nombre }}</h3>
          <p class="text-sm text-gray-600">{{ viajeSeleccionado.destino }}</p>
        </div>

        <!-- Información General -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Calendar class="w-4 h-4 text-orange-600" />
              <span class="text-xs font-medium text-gray-600">Fecha de Inicio</span>
            </div>
            <p class="text-sm font-semibold text-gray-900">
              {{ formatDateFull(viajeSeleccionado.fecha_inicio) }}
            </p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <Calendar class="w-4 h-4 text-orange-600" />
              <span class="text-xs font-medium text-gray-600">Fecha de Fin</span>
            </div>
            <p class="text-sm font-semibold text-gray-900">
              {{ formatDateFull(viajeSeleccionado.fecha_fin) }}
            </p>
          </div>
        </div>

        <!-- Estado y Progreso -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-700">Estado del Viaje</span>
            <span
              class="inline-flex px-3 py-1 text-xs font-medium rounded-full"
              :class="getEstadoClass(viajeSeleccionado.estado)"
            >
              {{ formatEstado(viajeSeleccionado.estado) }}
            </span>
          </div>
          <div>
            <div class="flex justify-between text-xs text-gray-600 mb-2">
              <span>Progreso General</span>
              <span class="font-semibold">{{ viajeSeleccionado.progreso_porcentaje }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-orange-500 h-3 rounded-full transition-all duration-300"
                :style="{ width: viajeSeleccionado.progreso_porcentaje + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Segmentos -->
        <div v-if="viajeSeleccionado.total_segmentos > 0">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">
            Itinerario ({{ viajeSeleccionado.total_segmentos }} segmentos)
          </h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="(segmento, index) in viajeSeleccionado.segmentos"
              :key="index"
              class="flex items-center justify-between p-3 rounded-lg transition-all"
              :class="
                segmento.es_actual
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : segmento.estado === 'completado'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
              "
            >
              <div class="flex items-center gap-3 flex-1">
                <div class="text-2xl">
                  {{ getSegmentoIcon(segmento.tipo, segmento.subtipo) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ segmento.nombre }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatDateFull(segmento.fecha_inicio) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="
                    segmento.estado === 'completado'
                      ? 'bg-green-100 text-green-800'
                      : segmento.es_actual
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600'
                  "
                >
                  {{ segmento.porcentaje }}%
                </div>
                <span
                  v-if="segmento.es_actual"
                  class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded"
                >
                  Actual
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="showModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            @click="irADetalle"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Ver Detalle Completo
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Clock, MapPin } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import { viajesService } from '@/services/viajes.service'

interface SegmentoData {
  id: string
  tipo: string
  nombre: string
  fecha_inicio: string
  fecha_fin?: string
  segmento_transporte?: Array<{ tipo_transporte: string }> | { tipo_transporte: string }
  segmento_hospedaje?: Array<{ tipo_hospedaje: string }> | { tipo_hospedaje: string }
}

interface ViajeData {
  segmentos: SegmentoData[]
}

interface SegmentoInfo {
  nombre: string
  tipo: string
  fecha_inicio: string
  es_actual: boolean
  porcentaje: number
  estado: 'completado' | 'en_curso' | 'pendiente'
  subtipo?: string
}

interface Props {
  maxItems?: number
}

interface ViajeCard {
  id: string
  nombre: string
  destino: string
  fecha_inicio: string | null
  fecha_fin: string | null
  progreso_porcentaje: number
  estado: string | null
  segmentos: Array<{
    nombre: string
    tipo: string
    fecha_inicio: string
    es_actual: boolean
    porcentaje: number
    estado: 'completado' | 'en_curso' | 'pendiente'
    subtipo?: string
  }>
  total_segmentos: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  verTodos: []
  verDetalle: [viaje: ViajeCard]
}>()

const viajes = ref<ViajeCard[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showModal = ref(false)
const viajeSeleccionado = ref<ViajeCard | null>(null)

// Conectado a Supabase
const fetchViajesEnCurso = async () => {
  loading.value = true
  error.value = null

  try {
    // console.log('🔍 Cargando viajes en curso...')

    // Primero intentar con getInProgress
    const { data, error: serviceError } = await viajesService.getInProgress()

    // console.log('📊 Respuesta del servicio:', { data, serviceError })

    if (serviceError) {
      console.error('❌ Error del servicio:', serviceError)
      error.value = serviceError
      viajes.value = []
      return
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No se encontraron viajes en curso')
      viajes.value = []
      return
    }

    const ordered = (data || [])
      .sort((a, b) => (a.fecha_inicio || '').localeCompare(b.fecha_inicio || ''))
      .map((viaje) => {
        // console.log('🗺️ Procesando viaje:', viaje.nombre, 'Estado:', viaje.estado)

        // Procesar segmentos
        const segmentosInfo = procesarSegmentos(viaje)

        return {
          id: viaje.id,
          nombre: viaje.nombre,
          destino: viaje.cotizacion?.nombre || viaje.descripcion || 'Sin destino definido',
          fecha_inicio: viaje.fecha_inicio ?? null,
          fecha_fin: viaje.fecha_fin ?? null,
          progreso_porcentaje: viaje.progreso_porcentaje ?? 0,
          estado: viaje.estado ?? null,
          segmentos: segmentosInfo.segmentos,
          total_segmentos: segmentosInfo.total,
        }
      })

    viajes.value = props.maxItems ? ordered.slice(0, props.maxItems) : ordered
    // console.log('✅ Viajes cargados:', viajes.value.length)
  } catch (err) {
    error.value = 'Error al cargar los viajes en curso'
    console.error('❌ Error fetching viajes en curso:', err)
  } finally {
    loading.value = false
  }
}

// Funciones auxiliares
// Parsear fecha en zona horaria local (evita problemas con UTC)
const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Sin fecha'

  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}

const calcularDiasRestantes = (fechaFin: string | null | undefined, estado?: string | null) => {
  if (!fechaFin) return 'Sin fecha'

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const fin = parseLocalDate(fechaFin)
  fin.setHours(0, 0, 0, 0)
  const diffTime = fin.getTime() - hoy.getTime()

  // Si está "en_curso" y es el mismo día, mostrar horas
  if (estado === 'en_curso' && hoy.toDateString() === fin.toDateString()) {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const horasRestantes = Math.max(0, diffHours)
    return `${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'} restantes`
  }

  // De lo contrario, mostrar días como antes
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diasRestantes = Math.max(0, diffDays)
  return `${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} restantes`
}

const calcularDiasParaIniciar = (fechaInicio: string | null | undefined) => {
  if (!fechaInicio) return 'Sin fecha'

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const inicio = parseLocalDate(fechaInicio)
  inicio.setHours(0, 0, 0, 0)
  const diffTime = inicio.getTime() - hoy.getTime()

  // Si es el mismo día, mostrar horas
  if (hoy.toDateString() === inicio.toDateString()) {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const horasRestantes = Math.max(0, diffHours)
    return `Inicia en ${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}`
  }

  // De lo contrario, mostrar días
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diasRestantes = Math.max(0, diffDays)

  if (diasRestantes === 0) {
    return 'Inicia hoy'
  }

  return `Inicia en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`
}

const getEstadoClass = (estado?: string | null) => {
  switch (estado) {
    case 'en_curso':
      return 'bg-orange-100 text-orange-800'
    case 'por_iniciar':
      return 'bg-amber-100 text-amber-700'
    case 'finalizado':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const formatEstado = (estado?: string | null) => {
  switch (estado) {
    case 'en_curso':
      return 'En curso'
    case 'por_iniciar':
      return 'Por iniciar'
    case 'finalizado':
      return 'Finalizado'
    default:
      return 'Sin estado'
  }
}

const procesarSegmentos = (viaje: ViajeData) => {
  if (!viaje.segmentos || viaje.segmentos.length === 0) {
    return { segmentos: [], total: 0 }
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // Ordenar segmentos por fecha de inicio
  const segmentosOrdenados = [...viaje.segmentos].sort((a, b) => {
    const fechaA = parseLocalDate(a.fecha_inicio)
    const fechaB = parseLocalDate(b.fecha_inicio)
    return fechaA.getTime() - fechaB.getTime()
  })

  // Determinar cuál es el segmento actual
  let indiceActual = -1

  // Buscar el segmento actual (en curso)
  for (let i = 0; i < segmentosOrdenados.length; i++) {
    const segmento = segmentosOrdenados[i]
    const fechaInicio = parseLocalDate(segmento.fecha_inicio)
    const fechaFin = segmento.fecha_fin ? parseLocalDate(segmento.fecha_fin) : null

    fechaInicio.setHours(0, 0, 0, 0)
    if (fechaFin) fechaFin.setHours(23, 59, 59, 999)

    // Si el segmento está en curso (hoy está entre inicio y fin)
    if (fechaInicio <= hoy && (!fechaFin || fechaFin >= hoy)) {
      indiceActual = i
      break
    }
  }

  // Si no hay segmento en curso, buscar el próximo
  if (indiceActual === -1) {
    indiceActual = segmentosOrdenados.findIndex((seg) => {
      const fechaInicio = parseLocalDate(seg.fecha_inicio)
      fechaInicio.setHours(0, 0, 0, 0)
      return fechaInicio > hoy
    })
  }

  // Si no hay próximo, marcar el primero
  if (indiceActual === -1 && segmentosOrdenados.length > 0) {
    indiceActual = 0
  }

  // Mapear segmentos con información de cuál es el actual y su porcentaje
  const segmentos = segmentosOrdenados.map((seg, index) => {
    const porcentajeInfo = calcularPorcentajeSegmento(seg, hoy)

    // Obtener subtipo específico
    let subtipo: string | undefined
    if (seg.tipo === 'transporte' && seg.segmento_transporte) {
      subtipo = Array.isArray(seg.segmento_transporte)
        ? seg.segmento_transporte[0]?.tipo_transporte
        : seg.segmento_transporte.tipo_transporte
    } else if (seg.tipo === 'hospedaje' && seg.segmento_hospedaje) {
      subtipo = Array.isArray(seg.segmento_hospedaje)
        ? seg.segmento_hospedaje[0]?.tipo_hospedaje
        : seg.segmento_hospedaje.tipo_hospedaje
    }

    return {
      nombre: seg.nombre,
      tipo: seg.tipo,
      fecha_inicio: seg.fecha_inicio,
      es_actual: index === indiceActual,
      porcentaje: porcentajeInfo.porcentaje,
      estado: porcentajeInfo.estado,
      subtipo,
    }
  })

  return {
    segmentos,
    total: segmentosOrdenados.length,
  }
}

const calcularPorcentajeSegmento = (segmento: SegmentoData, hoy: Date) => {
  const fechaInicio = parseLocalDate(segmento.fecha_inicio)
  const fechaFin = segmento.fecha_fin ? parseLocalDate(segmento.fecha_fin) : null

  fechaInicio.setHours(0, 0, 0, 0)
  if (fechaFin) fechaFin.setHours(23, 59, 59, 999)

  // Si no tiene fecha fin, considerar 1 día
  const fechaFinCalculo = fechaFin || new Date(fechaInicio.getTime() + 24 * 60 * 60 * 1000)

  // Segmento completado
  if (fechaFinCalculo < hoy) {
    return { porcentaje: 100, estado: 'completado' as const }
  }

  // Segmento pendiente
  if (fechaInicio > hoy) {
    return { porcentaje: 0, estado: 'pendiente' as const }
  }

  // Segmento en curso - calcular porcentaje
  const duracionTotal = fechaFinCalculo.getTime() - fechaInicio.getTime()
  const tiempoTranscurrido = hoy.getTime() - fechaInicio.getTime()
  const porcentaje = Math.min(
    100,
    Math.max(0, Math.round((tiempoTranscurrido / duracionTotal) * 100)),
  )

  return { porcentaje, estado: 'en_curso' as const }
}

const getSegmentoClasses = (segmento: SegmentoInfo) => {
  const baseClasses = 'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all'

  if (segmento.estado === 'completado') {
    return `${baseClasses} bg-green-100 text-green-800`
  }

  if (segmento.es_actual) {
    return `${baseClasses} bg-blue-100 text-blue-800 font-medium ring-2 ring-blue-300`
  }

  return `${baseClasses} bg-gray-100 text-gray-600`
}

const getSegmentoIcon = (tipo: string, subtipo?: string) => {
  // Emojis específicos para transporte
  if (tipo === 'transporte') {
    switch (subtipo) {
      case 'aereo':
        return '✈️' // Avión
      case 'tren':
        return '🚆' // Tren
      case 'bus':
        return '🚌' // Bus
      case 'carro_privado':
        return '🚗' // Carro
      case 'auto_rentado':
        return '🚙' // Auto rentado
      case 'uber':
        return '🚕' // Taxi/Uber
      default:
        return '🚎' // Transporte genérico
    }
  }

  // Emojis específicos para hospedaje
  if (tipo === 'hospedaje') {
    switch (subtipo) {
      case 'hotel':
        return '🏨' // Hotel
      case 'renta_privada':
        return '🏡' // Casa
      case 'airbnb':
        return '🏚️' // Casa de campo
      default:
        return '🏘️' // Edificio
    }
  }

  // Emoji para actividades
  if (tipo === 'actividad') {
    return '🎯' // Actividad/Diana
  }

  return '📍' // Pin de ubicación por defecto
}

const abrirModal = (viaje: ViajeCard) => {
  viajeSeleccionado.value = viaje
  showModal.value = true
}

const irADetalle = () => {
  if (viajeSeleccionado.value) {
    showModal.value = false
    // Emitir evento para navegar
    emit('verDetalle', viajeSeleccionado.value)
  }
}

const formatDateFull = (dateString: string | null | undefined) => {
  if (!dateString) return 'Sin fecha'

  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Inicializar
onMounted(() => {
  fetchViajesEnCurso()
})
</script>
