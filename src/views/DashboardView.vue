<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="w-full px-6 py-8">
      <!-- Header Title -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-600">Panel de administración</p>
      </div>

      <!-- Bento Grid Layout - Estadísticas + Viajes en Curso -->
      <!-- Primera fila: Estadísticas (más estrechas) + Viajes en Curso -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Estadísticas con Componente (ocupa 1 columna - 33%) -->
        <div class="bg-white rounded-xl border border-gray-200 lg:col-span-1">
          <EstadisticasGenerales />
        </div>

        <!-- Viajes en Curso con Componente (ocupa 2 columnas - 67%) -->
        <div class="bg-white rounded-xl border border-gray-200 lg:col-span-2">
          <ViajesEnCurso
            @ver-todos="navigateToViajes"
            @ver-detalle="handleViajeDetalle"
            @ver-detalle-segmento="handleSegmentoDetalle"
          />
        </div>
      </div>

      <!-- Segunda fila: Pasaportes + Visas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Pasaportes por Vencer con Componente -->
        <div class="bg-white rounded-xl border border-gray-200">
          <PasaportesPorVencer
            @ver-todos="navigateToClientes"
            @ver-detalle="handlePasaporteDetalle"
          />
        </div>

        <!-- Visas por Vencer con Componente -->
        <div class="bg-white rounded-xl border border-gray-200">
          <VisasPorVencer @ver-todos="navigateToClientes" @ver-detalle="handleVisaDetalle" />
        </div>
      </div>

      <!-- Tercera fila: Cumpleaños (de extremo a extremo) -->
      <div class="grid grid-cols-1 gap-6">
        <!-- Cumpleaños con Componente -->
        <div class="bg-white rounded-xl border border-gray-200">
          <Cumpleanos @ver-todos="navigateToClientes" @ver-detalle="handleCumpleanosDetalle" />
        </div>
      </div>
    </main>

    <!-- Modal de Detalle de Segmento -->
    <SegmentoDetailModal
      v-if="segmentoSeleccionado"
      v-model="showSegmentoModal"
      :segmento="segmentoSeleccionado"
      @close="closeSegmentoModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  EstadisticasGenerales,
  ViajesEnCurso,
  VisasPorVencer,
  CumpleanosHoy as Cumpleanos,
  PasaportesPorVencer,
} from '@/components/dashboard'
import SegmentoDetailModal from '@/components/SegmentoDetailModal.vue'
import type { Segmento } from '@/services/supabase'

interface SegmentoInfo {
  nombre: string
  tipo: string
  fecha_inicio: string
  es_actual: boolean
  porcentaje: number
  estado: 'completado' | 'en_curso' | 'pendiente'
  subtipo?: string
}

interface ViajeWithId {
  id: string | number
}

interface VisaPorVencer {
  id: string
  cliente: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
  pais: string
  tipo: string
  numero: string
  fechaEmision: string
  fechaVencimiento: string
  diasRestantes: number
  estado: 'Activa' | 'Por Vencer' | 'Vencida'
}

interface Cumpleanos {
  id: string
  cliente: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
  }
  fechaNacimiento: string
  diasParaCumpleanos: number
  mes: number
  dia: number
}

interface PasaportePorVencer {
  id: string
  cliente: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono?: string
  }
  numero: string
  nacionalidad: string
  fechaEmision: string
  fechaVencimiento: string
  diasRestantes: number
  expediente?: string
  estado: 'Activo' | 'Por Vencer' | 'Vencido'
}

const router = useRouter()

// Estado para el modal de segmentos
const showSegmentoModal = ref(false)
const segmentoSeleccionado = ref<Segmento | null>(null)

// Funciones de navegación básicas
const navigateToViajes = () => {
  router.push('/viajes')
}

const navigateToClientes = () => {
  router.push('/cliente')
}

// Handlers para eventos de detalle
const handleViajeDetalle = (viaje: ViajeWithId) => {
  // console.log('Navegando a detalle del viaje:', viaje)
  router.push(`/viajes/${viaje.id}`)
}

const handleSegmentoDetalle = (segmento: SegmentoInfo) => {
  // Convertir SegmentoInfo a un formato compatible con Segmento
  const segmentoData: Segmento = {
    id: 'temp-' + Date.now(), // ID temporal ya que solo es para visualización
    nombre: segmento.nombre,
    tipo: segmento.tipo as 'transporte' | 'hospedaje' | 'actividad',
    fecha_inicio: segmento.fecha_inicio,
    fecha_fin: segmento.fecha_inicio, // Usamos la misma fecha ya que no tenemos fecha_fin
    proveedor: segmento.subtipo || segmento.tipo,
    observaciones: `Estado: ${segmento.estado}\nProgreso: ${segmento.porcentaje}%${segmento.es_actual ? '\nSegmento actual' : ''}`,
    orden: 1,
    es_primero: false,
    es_ultimo: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Campos opcionales para el modal
    segmento_transporte:
      segmento.tipo === 'transporte'
        ? {
            id: 'temp',
            segmento_id: 'temp',
            tipo_transporte:
              (segmento.subtipo as
                | 'aereo'
                | 'tren'
                | 'bus'
                | 'carro_privado'
                | 'auto_rentado'
                | 'uber'
                | 'otro') || 'aereo',
            origen: 'N/A',
            destino: 'N/A',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined,
    segmento_hospedaje:
      segmento.tipo === 'hospedaje'
        ? {
            id: 'temp',
            segmento_id: 'temp',
            tipo_hospedaje:
              (segmento.subtipo as
                | 'hotel'
                | 'renta_privada'
                | 'airbnb'
                | 'otro') || 'hotel',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined,
    segmento_actividad:
      segmento.tipo === 'actividad'
        ? {
            id: 'temp',
            segmento_id: 'temp',
            duracion_horas: 2, // Valor por defecto
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined,
  }

  segmentoSeleccionado.value = segmentoData
  showSegmentoModal.value = true
}

const handleVisaDetalle = (visa: VisaPorVencer) => {
  // console.log('Ver detalle de la visa:', visa)
  alert(`Ver detalle de visa de ${visa.cliente.nombre} ${visa.cliente.apellido}`)
}

const handleCumpleanosDetalle = (cumpleanos: Cumpleanos) => {
  // console.log('Ver detalle del cumpleaños:', cumpleanos)
  alert(`Ver detalle de cumpleaños de ${cumpleanos.cliente.nombre} ${cumpleanos.cliente.apellido}`)
}

const handlePasaporteDetalle = (pasaporte: PasaportePorVencer) => {
  // console.log('Ver detalle del pasaporte:', pasaporte)
  alert(`Ver detalle de pasaporte de ${pasaporte.cliente.nombre} ${pasaporte.cliente.apellido}`)
}

const closeSegmentoModal = () => {
  showSegmentoModal.value = false
  segmentoSeleccionado.value = null
}
</script>
