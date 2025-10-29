<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header con información del cliente -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">
                {{ authStore.user?.profile?.nombre }} {{ authStore.user?.profile?.apellido }}
              </h1>
              <p class="text-gray-600">{{ authStore.user?.profile?.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="cargarViajes"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-orange-300 rounded-xl text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Recargar viajes"
            >
              <svg
                class="w-4 h-4 mr-2"
                :class="{ 'animate-spin': loading }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ loading ? 'Cargando...' : 'Recargar' }}
            </button>
            <button
              @click="logout"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut class="w-4 h-4 mr-2" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Pestañas -->
      <div class="mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'en-curso'"
              :class="[
                activeTab === 'en-curso'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              ]"
            >
              <div class="flex items-center gap-2">
                <PlayCircle class="w-4 h-4" />
                En Curso
                <span
                  v-if="viajesEnCurso.length > 0"
                  class="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full"
                >
                  {{ viajesEnCurso.length }}
                </span>
              </div>
            </button>
            <button
              @click="activeTab = 'finalizados'"
              :class="[
                activeTab === 'finalizados'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              ]"
            >
              <div class="flex items-center gap-2">
                <CheckCircle class="w-4 h-4" />
                Finalizados
                <span
                  v-if="viajesFinalizados.length > 0"
                  class="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full"
                >
                  {{ viajesFinalizados.length }}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenido de las pestañas -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Pestaña En Curso -->
        <div v-if="activeTab === 'en-curso'" class="p-6">
          <div v-if="viajesEnCurso.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <PlayCircle class="w-8 h-8 text-orange-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No tienes viajes en curso</h3>
            <p class="text-gray-600">
              Cuando tengas viajes activos, aparecerán aquí con su progreso.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="viaje in viajesEnCurso"
              :key="viaje.id"
              class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="verDetalleViaje(viaje)"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ viaje.nombre }}</h3>
                  <p class="text-gray-600">{{ viaje.destino }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDateRange(viaje.fechaInicio, viaje.fechaFin) }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-orange-600">{{ viaje.progreso }}%</div>
                  <div class="text-xs text-gray-500">Completado</div>
                </div>
              </div>

              <!-- Barra de progreso -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso del viaje</span>
                  <span>{{ viaje.progreso }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: viaje.progreso + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Segmentos -->
              <div class="space-y-3">
                <h4 class="text-sm font-medium text-gray-900">Segmentos del viaje:</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    v-for="segmento in viaje.segmentos"
                    :key="segmento.id"
                    class="flex items-center gap-2 p-3 rounded-lg border"
                    :class="getSegmentoClass(segmento.estado)"
                  >
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="getSegmentoDotClass(segmento.estado)"
                    ></div>
                    <div class="flex-1">
                      <div class="text-sm font-medium">{{ segmento.nombre }}</div>
                      <div class="text-xs text-gray-500">{{ segmento.duracion }}</div>
                    </div>
                    <div class="text-xs font-medium" :class="getSegmentoTextClass(segmento.estado)">
                      {{ segmento.estado }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestaña Finalizados -->
        <div v-if="activeTab === 'finalizados'" class="p-6">
          <div v-if="viajesFinalizados.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No tienes viajes finalizados</h3>
            <p class="text-gray-600">Los viajes completados aparecerán aquí.</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="viaje in viajesFinalizados"
              :key="viaje.id"
              class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
              @click="verDetalleViaje(viaje)"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ viaje.nombre }}</h3>
                  <p class="text-gray-600">{{ viaje.destino }}</p>
                  <p class="text-sm text-gray-500">
                    {{ formatDateRange(viaje.fechaInicio, viaje.fechaFin) }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="w-5 h-5 text-green-600" />
                    <span class="text-sm font-medium text-green-600">100% Completado</span>
                  </div>
                  <div class="text-xs text-gray-500">
                    Finalizado el {{ formatDate(viaje.fechaFin) }}
                  </div>
                </div>
              </div>

              <!-- Resumen del viaje -->
              <div class="bg-green-50 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div class="font-medium text-gray-900">Duración total</div>
                    <div class="text-gray-600">
                      {{ calcularDuracion(viaje.fechaInicio, viaje.fechaFin) }}
                    </div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">Destino</div>
                    <div class="text-gray-600">{{ viaje.destino }}</div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">Estado</div>
                    <div class="text-green-600 font-medium">Finalizado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalle del viaje -->
      <Modal
        v-model="showViajeModal"
        :title="`Detalle del viaje: ${selectedViaje?.nombre}`"
        max-width="2xl"
      >
        <div v-if="selectedViaje" class="space-y-6">
          <!-- Información principal del viaje -->
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0"
            >
              <PlayCircle v-if="activeTab === 'en-curso'" class="w-6 h-6 text-orange-600" />
              <CheckCircle v-else class="w-6 h-6 text-green-600" />
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-gray-900 mb-1">{{ selectedViaje.nombre }}</h2>
              <div class="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin class="w-4 h-4" />
                <span>{{ selectedViaje.destino }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600 mb-3">
                <Calendar class="w-4 h-4" />
                <span>{{
                  formatDateRange(selectedViaje.fechaInicio, selectedViaje.fechaFin)
                }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-gray-600" />
                <span class="text-gray-600">{{
                  calcularDuracion(selectedViaje.fechaInicio, selectedViaje.fechaFin)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Estado del viaje -->
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-900">Estado del viaje</span>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  selectedViaje.progreso === 100
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                "
              >
                {{ selectedViaje.progreso === 100 ? 'Completado' : 'En progreso' }}
              </span>
            </div>

            <!-- Barra de progreso -->
            <div class="mb-2">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{{ selectedViaje.progreso }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="selectedViaje.progreso === 100 ? 'bg-green-500' : 'bg-orange-500'"
                  :style="{ width: selectedViaje.progreso + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Segmentos del viaje -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Segmentos del viaje</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="segmento in selectedViaje.segmentos"
                :key="segmento.id"
                class="flex items-center gap-3 p-3 rounded-lg border"
                :class="getSegmentoClass(segmento.estado)"
              >
                <div
                  class="w-3 h-3 rounded-full"
                  :class="getSegmentoDotClass(segmento.estado)"
                ></div>
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ segmento.nombre }}</div>
                  <div class="text-sm text-gray-600">{{ segmento.duracion }}</div>
                </div>
                <div class="text-xs font-medium" :class="getSegmentoTextClass(segmento.estado)">
                  {{ segmento.estado }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, LogOut, PlayCircle, CheckCircle, Calendar, MapPin, Clock } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/ui/Modal.vue'
import { viajesService, type ViajeWithDetails } from '@/services/viajes.service'
import type { Segmento } from '@/services/supabase'

// Interfaz extendida para la UI con campos en camelCase
interface SegmentoUI extends Segmento {
  estado: 'activo' | 'inactivo' | 'finalizado'
  duracion: string
}

interface ViajeUI extends ViajeWithDetails {
  fechaInicio: string
  fechaFin: string
  progreso: number
  destino: string
  segmentos: SegmentoUI[]
}

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'en-curso' | 'finalizados'>('en-curso')
const loading = ref(false)

// Intervalo para verificar estado del usuario periódicamente
let statusCheckInterval: number | null = null

// Estado para el modal de detalle del viaje
const showViajeModal = ref(false)
const selectedViaje = ref<ViajeUI | null>(null)

// Datos de viajes del usuario (reemplaza mock data)
const viajes = ref<ViajeUI[]>([])

// Función para determinar el estado de un segmento
const determinarEstadoSegmento = (segmento: Segmento): 'activo' | 'inactivo' | 'finalizado' => {
  const ahora = new Date()
  const fechaInicio = segmento.fecha_inicio ? new Date(segmento.fecha_inicio) : null
  const fechaFin = segmento.fecha_fin ? new Date(segmento.fecha_fin) : null

  if (!fechaInicio) return 'inactivo'

  if (fechaFin && ahora > fechaFin) {
    return 'finalizado'
  }

  if (ahora >= fechaInicio && (!fechaFin || ahora <= fechaFin)) {
    return 'activo'
  }

  return 'inactivo'
}

// Función para calcular duración de un segmento
const calcularDuracionSegmento = (segmento: Segmento): string => {
  if (!segmento.fecha_inicio) return 'Sin fecha'

  const inicio = parseLocalDate(segmento.fecha_inicio)
  const fin = segmento.fecha_fin ? parseLocalDate(segmento.fecha_fin) : inicio

  const diffTime = Math.abs(fin.getTime() - inicio.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  }

  return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
}

// Función para transformar ViajeWithDetails a ViajeUI
const transformarViaje = (viaje: ViajeWithDetails): ViajeUI => {
  // Extraer destino de la descripción o nombre del viaje
  let destino = viaje.descripcion || viaje.nombre || 'Destino no especificado'

  // Si hay segmentos de transporte, intentar extraer destino del nombre
  const segmentoTransporte = viaje.segmentos.find((s) => s.tipo === 'transporte')
  if (segmentoTransporte) {
    // Intentar extraer destino del nombre del segmento (ej: "Vuelo a Bogotá")
    const match = segmentoTransporte.nombre.match(/a\s+(.+)$/i)
    if (match) {
      destino = match[1]
    }
  }

  // Transformar segmentos
  const segmentosUI: SegmentoUI[] = viaje.segmentos.map((seg) => ({
    ...seg,
    estado: determinarEstadoSegmento(seg),
    duracion: calcularDuracionSegmento(seg),
  }))

  return {
    ...viaje,
    fechaInicio: viaje.fecha_inicio,
    fechaFin: viaje.fecha_fin || viaje.fecha_inicio,
    progreso: viaje.progreso_porcentaje || 0,
    destino,
    segmentos: segmentosUI,
  }
}

// Computed para filtrar viajes en curso
const viajesEnCurso = computed(() => {
  return viajes.value.filter(
    (viaje) => viaje.estado === 'en_curso' || viaje.estado === 'por_iniciar',
  )
})

// Computed para filtrar viajes finalizados
const viajesFinalizados = computed(() => {
  return viajes.value.filter((viaje) => viaje.estado === 'finalizado')
})

// Cargar viajes del usuario desde Supabase
const cargarViajes = async () => {
  if (!authStore.user?.profile?.id) {
    // console.log('❌ No hay usuario logueado')
    // console.log('📊 Estado del authStore:', { isAuthenticated: authStore.isAuthenticated, user: authStore.user, profile: authStore.user?.profile })
    return
  }

  loading.value = true
  const userId = authStore.user.profile.id
  // console.log('🔄 Cargando viajes del usuario:', userId)
  // console.log('📊 Información del usuario:', { id: userId, email: authStore.user.email, identidad: authStore.user.profile.identidad, nombre: authStore.user.profile.nombre })

  try {
    const result = await viajesService.getViajesByViajero(userId)

    if (result.error) {
      console.error('❌ Error cargando viajes:', result.error)
    } else {
      // console.log('📦 Viajes recibidos de Supabase:', result.data?.length || 0)
      if (result.data && result.data.length > 0) {
        // console.log('📋 Detalle de viajes:', result.data.map((v) => ({ id: v.id, nombre: v.nombre })))
      }

      // Transformar los viajes de Supabase al formato de la UI
      viajes.value = (result.data || []).map(transformarViaje)
      // console.log('✅ Viajes cargados y transformados:', viajes.value.length)
    }
  } catch (error) {
    console.error('❌ Error al cargar viajes:', error)
  } finally {
    loading.value = false
  }
}

// Funciones auxiliares
// Parsear fecha como fecha local (evita problemas con zonas horarias)
const parseLocalDate = (dateString: string) => {
  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (dateMatch) {
    const [, year, month, day] = dateMatch.map(Number)
    return new Date(year, month - 1, day)
  }
  const date = new Date(dateString)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const formatDate = (dateString: string) => {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateRange = (inicio: string, fin: string) => {
  return `${formatDate(inicio)} - ${formatDate(fin)}`
}

const calcularDuracion = (inicio: string, fin: string) => {
  const inicioDate = parseLocalDate(inicio)
  const finDate = parseLocalDate(fin)
  const diffTime = Math.abs(finDate.getTime() - inicioDate.getTime())
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  }

  return `${diffHours} horas`
}

const getSegmentoClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'bg-orange-50 border-orange-200'
    case 'finalizado':
      return 'bg-green-50 border-green-200'
    case 'inactivo':
      return 'bg-gray-50 border-gray-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

const getSegmentoDotClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'bg-orange-500'
    case 'finalizado':
      return 'bg-green-500'
    case 'inactivo':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

const getSegmentoTextClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'text-orange-700'
    case 'finalizado':
      return 'text-green-700'
    case 'inactivo':
      return 'text-gray-500'
    default:
      return 'text-gray-500'
  }
}

const verDetalleViaje = (viaje: ViajeUI) => {
  selectedViaje.value = viaje
  showViajeModal.value = true
}

// Verificar si el usuario está activo
const verificarUsuarioActivo = async () => {
  // console.log('🔍 Verificando usuario activo:', authStore.user)

  // Refrescar la sesión para obtener la información más actualizada
  await authStore.refreshSession()

  if (!authStore.user) {
    // console.log('❌ No hay usuario logueado')
    router.push('/login-viajero')
    return false
  }

  // Verificar si el usuario tiene un perfil y está activo
  if (authStore.user.profile && authStore.user.profile.activo === false) {
    // console.log('❌ Usuario desactivado, redirigiendo al login')
    alert('Tu cuenta ha sido desactivada. Contacta al administrador.')
    authStore.logout()
    router.push('/login-viajero')
    return false
  }

  // console.log('✅ Usuario activo')
  return true
}

const logout = () => {
  authStore.logout()
  router.push('/')
}

// Verificar estado del usuario al montar el componente
onMounted(async () => {
  // console.log('🚀 ClientViajesView montado')
  await verificarUsuarioActivo()

  // Cargar viajes del usuario
  await cargarViajes()

  // Verificar estado del usuario cada 30 segundos
  statusCheckInterval = window.setInterval(async () => {
    if (authStore.isAuthenticated) {
      // console.log('🔄 Verificación periódica del estado del usuario')
      await verificarUsuarioActivo()
    }
  }, 30000) // 30 segundos
})

// Limpiar intervalo al desmontar
onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
    statusCheckInterval = null
  }
})

// Monitorear cambios en el estado del usuario
watch(
  () => authStore.user,
  async (nuevoUsuario, usuarioAnterior) => {
    // console.log('👀 Usuario cambió:', nuevoUsuario)

    // Si no hay usuario, redirigir
    if (!nuevoUsuario) {
      // console.log('❌ Usuario se deslogueó')
      router.push('/login-viajero')
      return
    }

    // Si el usuario cambió o si es la primera vez, refrescar la sesión
    if (!usuarioAnterior || nuevoUsuario.id !== usuarioAnterior.id) {
      // console.log('🔄 Refrescando sesión por cambio de usuario')
      await authStore.refreshSession()
    }

    // Verificar si el usuario fue desactivado
    if (nuevoUsuario.profile && nuevoUsuario.profile.activo === false) {
      // console.log('❌ Usuario fue desactivado')
      alert('Tu cuenta ha sido desactivada. Contacta al administrador.')
      authStore.logout()
      router.push('/login-viajero')
    }
  },
  { deep: true },
)
</script>
