<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <Cake class="w-4 h-4 text-orange-600" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Cumpleaños</h3>
      </div>
      <p class="text-sm text-gray-600 ml-10">Próximos cumpleaños</p>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 text-sm">{{ error }}</p>
      <button @click="fetchCumpleanos" class="mt-2 text-sm text-orange-600 hover:text-orange-700">
        Reintentar
      </button>
    </div>

    <div v-else-if="cumpleanos.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No hay cumpleaños registrados.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="cumple in cumpleanos"
        :key="cumple.id"
        class="relative p-3 rounded-lg transition-all hover:shadow-md cursor-pointer"
        :class="getCardClasses(cumple.diasParaCumpleanos)"
        @click="cumple.cliente.telefono ? abrirMensaje(cumple) : null"
      >
        <!-- Badge de días -->
        <div
          class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
          :class="getProximidadBadgeClass(cumple.diasParaCumpleanos)"
        >
          {{ cumple.diasParaCumpleanos === 0 ? '¡Hoy!' : `${cumple.diasParaCumpleanos}d` }}
        </div>

        <!-- Contenido -->
        <div class="flex flex-col gap-2">
          <!-- Icono y nombre -->
          <div class="flex items-start gap-2 pr-12">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getIconWrapperClass(cumple.diasParaCumpleanos)"
            >
              <Cake class="w-5 h-5" :class="getIconClass(cumple.diasParaCumpleanos)" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-900 text-sm leading-tight truncate">
                {{ cumple.cliente.nombre }}
              </h4>
              <p class="text-xs text-gray-600 truncate">{{ cumple.cliente.apellido }}</p>
            </div>
          </div>

          <!-- Información -->
          <div class="space-y-1 text-xs">
            <div class="flex items-center gap-1.5 text-gray-600">
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ formatDate(cumple.fechaNacimiento) }}</span>
            </div>
            <div
              class="flex items-center gap-1.5"
              :class="getProximidadClass(cumple.diasParaCumpleanos)"
            >
              <Cake class="w-3.5 h-3.5" />
              <span class="font-medium">
                {{ cumple.diasParaCumpleanos === 0 ? '¡Hoy cumple!' : 'Cumplirá' }}
                {{ calcularEdad(cumple.fechaNacimiento) + 1 }} años
              </span>
            </div>
          </div>

          <!-- Botón WhatsApp (solo si tiene teléfono) -->
          <button
            v-if="cumple.cliente.telefono"
            type="button"
            class="mt-1 w-full flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors"
            :class="getWhatsappButtonClasses(cumple.diasParaCumpleanos)"
            @click.stop="abrirMensaje(cumple)"
            title="Enviar mensaje de WhatsApp"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
              />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>

  <transition name="fade">
    <div
      v-if="mostrarModal && cumpleSeleccionado"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-xl rounded-lg bg-white border border-gray-200">
        <div class="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Enviar felicitación</h3>
            <p class="text-sm text-gray-500">
              {{ cumpleSeleccionado.cliente.nombre }} {{ cumpleSeleccionado.cliente.apellido }} ·
              {{ formatPhoneHN(cumpleSeleccionado.cliente.telefono) || 'Sin teléfono' }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            @click="cerrarMensaje"
          >
            <span class="sr-only">Cerrar</span>
            ✕
          </button>
        </div>

        <div class="space-y-4 px-6 py-5">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase text-gray-500">Cumpleaños</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(cumpleSeleccionado.fechaNacimiento) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Edad</p>
              <p class="text-sm font-medium text-gray-900">
                {{ calcularEdad(cumpleSeleccionado.fechaNacimiento) }} años
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Próximo en</p>
              <p class="text-sm font-medium text-gray-900">
                {{ cumpleSeleccionado.diasParaCumpleanos }} días
              </p>
            </div>
          </div>

          <div>
            <label class="text-xs uppercase text-gray-500" for="mensajeCumple">Mensaje</label>
            <textarea
              id="mensajeCumple"
              v-model="mensajePersonalizado"
              rows="4"
              class="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            ></textarea>
            <p class="mt-2 text-xs text-gray-500">
              El mensaje se enviará por WhatsApp en una nueva pestaña.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            class="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="cerrarMensaje"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            @click="enviarWhatsappMensaje"
          >
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Calendar, Cake } from 'lucide-vue-next'
import { supabase } from '@/services/supabase'

// Interfaces
interface Cliente {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
}

interface Cumpleanos {
  id: string
  cliente: Cliente
  fechaNacimiento: string
  diasParaCumpleanos: number
  mes: number
  dia: number
}

// Estado reactivo
const cumpleanos = ref<Cumpleanos[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const mostrarModal = ref(false)
const cumpleSeleccionado = ref<Cumpleanos | null>(null)
const mensajePersonalizado = ref('')

// Props y emits
defineProps<{
  maxItems?: number
}>()

defineEmits<{
  verTodos: []
  verDetalle: [cumpleanos: Cumpleanos]
}>()

// Conectado a Supabase - Optimizado con función RPC
const fetchCumpleanos = async () => {
  loading.value = true
  error.value = null

  try {
    // Usar función que trae TODOS los cumpleaños ordenados por proximidad
    const { data, error: supabaseError } = await supabase.rpc('get_todos_cumpleanos')

    if (supabaseError) throw supabaseError

    // Mapear datos de la función a la estructura del componente
    const cumpleanosData = (data || []).map(
      (viajero: {
        id: string
        nombre: string
        apellido: string
        email: string
        telefono: string | null
        fecha_nacimiento: string
        dias_para_cumpleanos: number
        mes: number
        dia: number
      }) => ({
        id: viajero.id,
        cliente: {
          id: viajero.id,
          nombre: viajero.nombre,
          apellido: viajero.apellido,
          email: viajero.email,
          telefono: viajero.telefono || undefined,
        },
        fechaNacimiento: viajero.fecha_nacimiento,
        diasParaCumpleanos: viajero.dias_para_cumpleanos,
        mes: viajero.mes,
        dia: viajero.dia,
      }),
    )

    cumpleanos.value = cumpleanosData
  } catch (err) {
    error.value = 'Error al cargar los cumpleaños'
    console.error('Error fetching cumpleaños:', err)
  } finally {
    loading.value = false
  }
}

// Inicializar
onMounted(() => {
  fetchCumpleanos()
})

// Funciones auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  })
}

const calcularEdad = (fechaNacimiento: string) => {
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--
  }

  return edad
}

const getCardClasses = (dias: number) => {
  if (dias === 0) return 'bg-red-50 hover:bg-red-100'
  if (dias <= 3) return 'bg-red-50 hover:bg-red-100'
  if (dias <= 7) return 'bg-orange-50 hover:bg-orange-100'
  if (dias <= 15) return 'bg-yellow-50 hover:bg-yellow-100'
  return 'bg-green-50 hover:bg-green-100'
}

const getIconWrapperClass = (dias: number) => {
  if (dias <= 3) return 'bg-red-100/90'
  if (dias <= 7) return 'bg-orange-100/90'
  if (dias <= 15) return 'bg-yellow-100/90'
  return 'bg-green-100/90'
}

const getIconClass = (dias: number) => {
  if (dias <= 3) return 'text-red-700'
  if (dias <= 7) return 'text-orange-700'
  if (dias <= 15) return 'text-yellow-700'
  return 'text-green-700'
}

const getProximidadClass = (dias: number) => {
  if (dias === 0) return 'text-red-600 font-semibold'
  if (dias <= 3) return 'text-red-600 font-medium'
  if (dias <= 7) return 'text-orange-600 font-medium'
  if (dias <= 15) return 'text-yellow-600 font-medium'
  return 'text-green-600 font-medium'
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

const getWhatsappLink = (telefono?: string, mensaje?: string) => {
  if (!telefono) return '#'

  const digits = telefono.replace(/\D/g, '')
  const normalized = (() => {
    if (digits.startsWith('504')) return digits
    if (digits.startsWith('00')) return digits.slice(2)
    return `504${digits}`
  })()

  const message = encodeURIComponent(mensaje ?? '¡Feliz cumpleaños desde ViajeMoz! 🎉')
  return `https://wa.me/${normalized}?text=${message}`
}

const getWhatsappButtonClasses = (dias: number) => {
  if (dias <= 3) {
    return 'bg-red-600 text-white hover:bg-red-700'
  }

  if (dias <= 7) {
    return 'bg-orange-600 text-white hover:bg-orange-700'
  }

  if (dias <= 15) {
    return 'bg-yellow-600 text-white hover:bg-yellow-700'
  }

  return 'bg-green-600 text-white hover:bg-green-700'
}

const getProximidadBadgeClass = (dias: number) => {
  if (dias === 0) return 'bg-red-600 text-white'
  if (dias <= 3) return 'bg-red-100 text-red-800'
  if (dias <= 7) return 'bg-orange-100 text-orange-800'
  if (dias <= 15) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const buildDefaultMessage = (cumple: Cumpleanos) => {
  return `¡Hola ${cumple.cliente.nombre}! 🎉 Desde ViajeMoz te deseamos un feliz cumpleaños. Que tengas un día increíble.`
}

const abrirMensaje = (cumple: Cumpleanos) => {
  cumpleSeleccionado.value = cumple
  mensajePersonalizado.value = buildDefaultMessage(cumple)
  mostrarModal.value = true
}

const cerrarMensaje = () => {
  mostrarModal.value = false
  cumpleSeleccionado.value = null
  mensajePersonalizado.value = ''
}

const enviarWhatsappMensaje = () => {
  if (!cumpleSeleccionado.value?.cliente.telefono) return
  const link = getWhatsappLink(
    cumpleSeleccionado.value.cliente.telefono,
    mensajePersonalizado.value,
  )
  window.open(link, '_blank', 'noopener,noreferrer')
  cerrarMensaje()
}

// Inicializar
onMounted(() => {
  fetchCumpleanos()
})
</script>
