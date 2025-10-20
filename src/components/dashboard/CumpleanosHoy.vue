<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Cake class="w-4 h-4 text-orange-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Cumpleaños</h3>
        </div>
        <p class="text-sm text-gray-600 ml-10">Clientes que celebran hoy</p>
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
      <button @click="fetchCumpleanos" class="mt-2 text-sm text-orange-600 hover:text-orange-700">
        Reintentar
      </button>
    </div>

    <div v-else-if="cumpleanos.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No hay cumpleaños próximos en los próximos 30 días.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="cumple in cumpleanos"
        :key="cumple.id"
        class="relative flex items-center justify-between p-3 rounded-lg transition-colors"
        :class="getCardClasses(cumple.diasParaCumpleanos)"
      >
        <button
          v-if="cumple.cliente.telefono"
          type="button"
          class="absolute top-3 right-3 inline-flex items-center px-3 py-1 text-xs font-semibold"
          :class="getWhatsappButtonClasses(cumple.diasParaCumpleanos)"
          @click="abrirMensaje(cumple)"
        >
          Enviar mensaje
        </button>

        <div class="pr-28 flex-1">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :class="getIconWrapperClass(cumple.diasParaCumpleanos)"
            >
              <Cake class="w-4 h-4" :class="getIconClass(cumple.diasParaCumpleanos)" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-gray-900 text-sm truncate">
                {{ cumple.cliente.nombre }} {{ cumple.cliente.apellido }}
              </h4>
              <p class="text-xs text-gray-600">{{ calcularEdad(cumple.fechaNacimiento) }} años</p>
            </div>
          </div>

          <!-- Información del cumpleaños -->
          <div class="mt-3 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" :class="getMetaIconClass(cumple.diasParaCumpleanos)" />
              <span class="text-sm text-gray-600">{{ formatDate(cumple.fechaNacimiento) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4" :class="getMetaIconClass(cumple.diasParaCumpleanos)" />
              <span class="text-sm" :class="getProximidadClass(cumple.diasParaCumpleanos)">
                {{ getProximidadText(cumple.diasParaCumpleanos) }}
              </span>
            </div>
          </div>
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
import { Calendar, Clock, Cake } from 'lucide-vue-next'
import { supabase } from '@/services/supabase'

type ViajeroCumpleanos = {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  fecha_nacimiento: string | null
}

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

// Conectado a Supabase
const fetchCumpleanos = async () => {
  loading.value = true
  error.value = null

  try {
    const hoy = new Date()
    const mesActual = hoy.getMonth() + 1 // 1-12
    const diaActual = hoy.getDate()

    // Obtener todos los viajeros con fecha de nacimiento
    const { data, error: supabaseError } = await supabase
      .from('viajeroz')
      .select(
        `
        id,
        nombre,
        apellido,
        email,
        telefono,
        fecha_nacimiento
      `,
      )
      .not('fecha_nacimiento', 'is', null)

    if (supabaseError) throw supabaseError

    // Filtrar y calcular días para cumpleaños del mes actual
    const cumpleanosData = (data || []).reduce<Cumpleanos[]>(
      (acc: Cumpleanos[], viajero: ViajeroCumpleanos) => {
        if (!viajero.fecha_nacimiento) return acc

        const fechaNac = new Date(viajero.fecha_nacimiento)
        const mesNac = fechaNac.getMonth() + 1
        const diaNac = fechaNac.getDate()

        // Solo incluir cumpleaños del mes actual
        if (mesNac !== mesActual) return acc

        // Calcular días hasta el cumpleaños
        const diasParaCumpleanos = diaNac - diaActual
        if (diasParaCumpleanos < 0) {
          // Ya pasó este mes
          return acc
        }

        acc.push({
          id: viajero.id,
          cliente: {
            id: viajero.id,
            nombre: viajero.nombre,
            apellido: viajero.apellido,
            email: viajero.email,
            telefono: viajero.telefono || undefined,
          },
          fechaNacimiento: viajero.fecha_nacimiento,
          diasParaCumpleanos,
          mes: mesNac,
          dia: diaNac,
        })

        return acc
      },
      [],
    )

    // Ordenar por días más cercanos primero
    cumpleanos.value = cumpleanosData.sort(
      (a: Cumpleanos, b: Cumpleanos) => a.diasParaCumpleanos - b.diasParaCumpleanos,
    )
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

const getMetaIconClass = (dias: number) => {
  if (dias <= 3) return 'text-red-500'
  if (dias <= 7) return 'text-orange-500'
  if (dias <= 15) return 'text-yellow-500'
  return 'text-green-500'
}

const getProximidadClass = (dias: number) => {
  if (dias <= 3) return 'text-red-600 font-medium'
  if (dias <= 7) return 'text-orange-600 font-medium'
  if (dias <= 15) return 'text-yellow-600 font-medium'
  return 'text-green-600 font-medium'
}

const getProximidadText = (dias: number) => {
  if (dias === 0) return '¡Hoy es su cumpleaños!'
  if (dias === 1) return 'Mañana celebra'
  if (dias <= 3) return `En ${dias} días`
  if (dias <= 7) return 'Próxima semana'
  if (dias <= 15) return `En ${dias} días`
  return `En ${dias} días`
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
    return 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
  }

  if (dias <= 7) {
    return 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
  }

  if (dias <= 15) {
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200'
  }

  return 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
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
