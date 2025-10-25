<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText class="w-4 h-4 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Pasaportes por Vencer</h3>
        </div>
        <p class="text-sm text-gray-600 ml-10">Todos los pasaportes registrados</p>
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
        @click="fetchPasaportesPorVencer"
        class="mt-2 text-sm text-orange-600 hover:text-orange-700"
      >
        Reintentar
      </button>
    </div>

    <div v-else-if="pasaportes.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No hay pasaportes registrados.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="pasaporte in pasaportes"
        :key="pasaporte.id"
        class="relative flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer"
        :class="getCardClasses(pasaporte.diasRestantes)"
        @click="abrirDetalle(pasaporte)"
      >
        <span
          class="absolute top-3 right-3 inline-flex px-2.5 py-1 text-xs font-semibold rounded-full"
          :class="getUrgenciaBadgeClass(pasaporte.diasRestantes)"
        >
          {{ getUrgenciaText(pasaporte.diasRestantes) }}
        </span>

        <div class="flex-1">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :class="getIconWrapperClass(pasaporte.diasRestantes)"
            >
              <FileText class="w-4 h-4" :class="getIconClass(pasaporte.diasRestantes)" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 text-sm truncate">
                {{ pasaporte.cliente.nombre }} {{ pasaporte.cliente.apellido }}
              </h4>
              <p class="text-xs text-gray-600 truncate">
                {{ pasaporte.nacionalidad }} - {{ pasaporte.numero }}
              </p>
            </div>
          </div>

          <!-- Información de vencimiento -->
          <div class="mt-3 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" :class="getMetaIconClass(pasaporte.diasRestantes)" />
              <span class="text-sm text-gray-600">
                Vence: {{ formatDate(pasaporte.fechaVencimiento) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4" :class="getMetaIconClass(pasaporte.diasRestantes)" />
              <span class="text-sm" :class="getUrgenciaClass(pasaporte.diasRestantes)">
                {{ pasaporte.diasRestantes }} días restantes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <transition name="fade">
    <div
      v-if="mostrarModal && pasaporteSeleccionado"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-xl rounded-lg bg-white border border-gray-200">
        <div class="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Detalle del pasaporte</h3>
            <p class="text-sm text-gray-500">
              Titular: {{ pasaporteSeleccionado.cliente.nombre }}
              {{ pasaporteSeleccionado.cliente.apellido }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            @click="cerrarDetalle"
          >
            <span class="sr-only">Cerrar</span>
            ✕
          </button>
        </div>

        <div class="space-y-4 px-6 py-5">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase text-gray-500">Número de pasaporte</p>
              <p class="text-sm font-medium text-gray-900">{{ pasaporteSeleccionado.numero }}</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Nacionalidad</p>
              <p class="text-sm font-medium text-gray-900">
                {{ pasaporteSeleccionado.nacionalidad }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Fecha de emisión</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(pasaporteSeleccionado.fechaEmision) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Fecha de vencimiento</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(pasaporteSeleccionado.fechaVencimiento) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Días restantes</p>
              <p
                class="text-sm font-semibold"
                :class="getUrgenciaClass(pasaporteSeleccionado.diasRestantes)"
              >
                {{ pasaporteSeleccionado.diasRestantes }} días
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Estado</p>
              <span
                class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                :class="getUrgenciaBadgeClass(pasaporteSeleccionado.diasRestantes)"
              >
                {{ pasaporteSeleccionado.estado }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase text-gray-500">Correo</p>
              <p class="text-sm text-gray-700">{{ pasaporteSeleccionado.cliente.email }}</p>
            </div>
            <div v-if="pasaporteSeleccionado.cliente.telefono">
              <p class="text-xs uppercase text-gray-500">Teléfono</p>
              <p class="text-sm text-gray-700">
                {{ formatPhoneHN(pasaporteSeleccionado.cliente.telefono) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            class="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="cerrarDetalle"
          >
            Cerrar
          </button>
          <button
            type="button"
            class="rounded-md px-4 py-2 text-sm font-semibold text-white"
            :class="getWhatsappButtonClasses(pasaporteSeleccionado?.diasRestantes ?? 0)"
            :disabled="!pasaporteSeleccionado?.cliente.telefono"
            @click="contactarClientePorWhatsapp"
          >
            Contactar cliente
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Clock, FileText } from 'lucide-vue-next'
import { supabase } from '@/services/supabase'

interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
}

interface PasaportePorVencer {
  id: string
  cliente: Cliente
  numero: string
  nacionalidad: string
  fechaEmision: string
  fechaVencimiento: string
  diasRestantes: number
  estado: 'Activo' | 'Por Vencer' | 'Vencido'
}

// Estado reactivo
const pasaportes = ref<PasaportePorVencer[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const mostrarModal = ref(false)
const pasaporteSeleccionado = ref<PasaportePorVencer | null>(null)

// Props y emits
const props = defineProps<{
  maxItems?: number
}>()

defineEmits<{
  verTodos: []
  verDetalle: [pasaporte: PasaportePorVencer]
}>()

// Conectado a Supabase - Optimizado con función RPC
const fetchPasaportesPorVencer = async () => {
  loading.value = true
  error.value = null

  try {
    // Usar función que trae TODOS los pasaportes activos
    const { data, error: supabaseError } = await supabase.rpc('get_todos_pasaportes')

    if (supabaseError) throw supabaseError

    // Mapear datos de la función a la estructura del componente
    const pasaportesData = (data || []).map(
      (viajero: {
        id: string
        nombre: string
        apellido: string
        email: string
        telefono: string | null
        pais_residencia: string
        numero_pasaporte: string
        fecha_vencimiento_pasaporte: string
        dias_restantes: number
        estado: string
      }) => ({
        id: viajero.id,
        cliente: {
          id: viajero.id,
          nombre: viajero.nombre,
          apellido: viajero.apellido,
          email: viajero.email,
          telefono: viajero.telefono || undefined,
        },
        numero: viajero.numero_pasaporte,
        nacionalidad: viajero.pais_residencia,
        fechaEmision: '',
        fechaVencimiento: viajero.fecha_vencimiento_pasaporte,
        diasRestantes: viajero.dias_restantes,
        estado: viajero.estado as 'Activo' | 'Por Vencer' | 'Vencido',
      }),
    )

    pasaportes.value = props.maxItems ? pasaportesData.slice(0, props.maxItems) : pasaportesData
  } catch (err) {
    error.value = 'Error al cargar los pasaportes por vencer'
    console.error('Error fetching pasaportes por vencer:', err)
  } finally {
    loading.value = false
  }
}

// Funciones auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getCardClasses = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'bg-red-50 hover:bg-red-100'
  if (diasRestantes <= 15) return 'bg-orange-50 hover:bg-orange-100'
  return 'bg-green-50 hover:bg-green-100'
}

const getIconWrapperClass = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'bg-red-100/90'
  if (diasRestantes <= 15) return 'bg-orange-100/90'
  return 'bg-green-100/90'
}

const getIconClass = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'text-red-700'
  if (diasRestantes <= 15) return 'text-orange-700'
  return 'text-green-700'
}

const getMetaIconClass = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'text-red-500'
  if (diasRestantes <= 15) return 'text-orange-500'
  return 'text-green-500'
}

const getUrgenciaClass = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'text-red-600 font-medium'
  if (diasRestantes <= 15) return 'text-orange-600 font-medium'
  return 'text-green-600 font-medium'
}

const getUrgenciaBadgeClass = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'bg-red-100 text-red-800'
  if (diasRestantes <= 15) return 'bg-orange-100 text-orange-800'
  return 'bg-green-100 text-green-800'
}

const getUrgenciaText = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'Renovar ahora'
  if (diasRestantes <= 15) return 'Revisión próxima'
  return 'Todo en orden'
}

const abrirDetalle = (pasaporte: PasaportePorVencer) => {
  pasaporteSeleccionado.value = pasaporte
  mostrarModal.value = true
}

const cerrarDetalle = () => {
  mostrarModal.value = false
  pasaporteSeleccionado.value = null
}

const formatPhoneHN = (telefono?: string) => {
  if (!telefono) return ''

  const digits = telefono.replace(/\D/g, '')
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }
  if (digits.length === 11 && digits.startsWith('504')) {
    return `+504 ${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 12 && digits.startsWith('00504')) {
    return `+504 ${digits.slice(5, 9)}-${digits.slice(9)}`
  }

  return telefono
}

const normalizePhoneHN = (telefono?: string) => {
  if (!telefono) return null
  const digits = telefono.replace(/\D/g, '')
  if (digits.startsWith('504')) return digits
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.length === 8) return `504${digits}`
  return digits.length > 0 ? digits : null
}

const buildWhatsappMessage = (pasaporte: PasaportePorVencer) => {
  return `Hola ${pasaporte.cliente.nombre}, te contactamos de ViajeMoz. Tu pasaporte (${pasaporte.numero}) vence el ${formatDate(pasaporte.fechaVencimiento)}. Escríbenos para ayudarte con la renovación.`
}

const abrirWhatsapp = (telefonoNormalizado: string, mensaje: string) => {
  const url = `https://wa.me/${telefonoNormalizado}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const contactarClientePorWhatsapp = () => {
  if (!pasaporteSeleccionado.value) return
  const telefono = normalizePhoneHN(pasaporteSeleccionado.value.cliente.telefono)
  if (!telefono) return
  const mensaje = buildWhatsappMessage(pasaporteSeleccionado.value)
  abrirWhatsapp(telefono, mensaje)
}

const getWhatsappButtonClasses = (diasRestantes: number) => {
  if (diasRestantes <= 7) return 'bg-red-600 hover:bg-red-700'
  if (diasRestantes <= 15) return 'bg-orange-600 hover:bg-orange-700'
  return 'bg-green-600 hover:bg-green-700'
}

// Inicializar
onMounted(() => {
  fetchPasaportesPorVencer()
})
</script>
