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
              <LogOut class="w-4 h-4 mr-2" /> Salir
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
                <PlayCircle class="w-4 h-4" /> En Curso
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
                <CheckCircle class="w-4 h-4" /> Finalizados
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
                  <span>Progreso del viaje</span> <span>{{ viaje.progreso }}%</span>
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
                    class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                    :class="getSegmentoClass(segmento.estado)"
                    @click.stop="verDetalleSegmento(segmento)"
                  >
                    <!-- Icono del tipo -->
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      :class="getSegmentoIconBg(segmento.tipo)"
                    >
                      <component
                        :is="getSegmentoIcon(segmento.tipo)"
                        class="w-5 h-5"
                        :class="getSegmentoIconColor(segmento.tipo)"
                      />
                    </div>
                    <!-- Información principal -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-1">
                        <div class="text-sm font-medium text-gray-900 truncate">
                          {{ segmento.nombre }}
                        </div>
                        <span
                          class="text-xs font-medium px-2 py-1 rounded-full"
                          :class="getEstadoBadgeClass(segmento.estado)"
                        >
                          {{ getEstadoText(segmento.estado) }}
                        </span>
                      </div>
                      <!-- Información específica por tipo -->
                      <div class="text-xs text-gray-600">
                        <div
                          v-if="
                            segmento.tipo === 'transporte' &&
                            segmento.segmento_transporte?.origen &&
                            segmento.segmento_transporte?.destino
                          "
                          class="flex items-center gap-1"
                        >
                          <span>
                            {{ segmento.segmento_transporte.origen }} →
                            {{ segmento.segmento_transporte.destino }}
                          </span>
                        </div>
                        <div
                          v-else-if="segmento.tipo === 'hospedaje' && segmento.segmento_hospedaje"
                          class="capitalize"
                        >
                          {{ segmento.segmento_hospedaje.tipo_hospedaje?.replace('_', ' ') }} •
                          Check-in:
                          {{
                            segmento.fecha_inicio
                              ? formatDate(segmento.fecha_inicio)
                              : 'Por confirmar'
                          }}
                        </div>
                        <div v-else-if="segmento.tipo === 'actividad'" class="capitalize">
                          {{
                            segmento.segmento_actividad?.duracion_horas
                              ? `${segmento.segmento_actividad.duracion_horas}h`
                              : ''
                          }}
                          {{
                            segmento.nombre.toLowerCase().includes('tour')
                              ? 'Tour'
                              : segmento.nombre.toLowerCase().includes('excursión')
                                ? 'Excursión'
                                : 'Actividad'
                          }}
                        </div>
                        <div v-else class="capitalize">{{ segmento.tipo }}</div>
                      </div>
                      <!-- Fecha y duración -->
                      <div class="flex items-center justify-between mt-1">
                        <span class="text-xs text-gray-500">
                          {{
                            segmento.fecha_inicio ? formatDate(segmento.fecha_inicio) : 'Sin fecha'
                          }}
                        </span>
                        <span class="text-xs text-gray-500">{{ segmento.duracion }}</span>
                      </div>
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
                <MapPin class="w-4 h-4" /> <span>{{ selectedViaje.destino }}</span>
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
                <span>Progreso</span> <span>{{ selectedViaje.progreso }}%</span>
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
                <div class="text-xs font-medium" :class="getEstadoBadgeClass(segmento.estado)">
                  {{ getEstadoText(segmento.estado) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <!-- Modal de detalle del segmento -->
      <Modal
        v-model="showSegmentoModal"
        :title="`Detalle del segmento: ${selectedSegmento?.nombre}`"
        max-width="2xl"
      >
        <div v-if="selectedSegmento" class="space-y-4">
          <!-- Información principal del segmento -->
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0"
            >
              <component
                :is="getSegmentoIcon(selectedSegmento.tipo)"
                class="w-6 h-6 text-orange-600"
              />
            </div>
            <div class="flex-1 space-y-2">
              <div>
                <div class="text-sm text-gray-500 capitalize mb-1">{{ selectedSegmento.tipo }}</div>
                <div class="text-xl font-semibold text-gray-900">{{ selectedSegmento.nombre }}</div>
                <div
                  v-if="
                    selectedSegmento.proveedor &&
                    selectedSegmento.proveedor !== selectedSegmento.nombre
                  "
                  class="text-sm text-gray-600 mt-1"
                >
                  Proveedor: {{ selectedSegmento.proveedor }}
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-2">
                <div class="flex items-center gap-1">
                  <Calendar class="w-4 h-4" />
                  <span>{{
                    selectedSegmento.fecha_inicio && selectedSegmento.fecha_fin
                      ? formatDateRange(selectedSegmento.fecha_inicio, selectedSegmento.fecha_fin)
                      : selectedSegmento.fecha_inicio
                        ? formatDate(selectedSegmento.fecha_inicio)
                        : 'Fecha no especificada'
                  }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Clock class="w-4 h-4" /> <span>{{ selectedSegmento.duracion }}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :class="getEstadoBadgeClass(selectedSegmento.estado)"
              >
                {{ getEstadoText(selectedSegmento.estado) }}
              </span>
            </div>
          </div>
          <!-- Detalles específicos por tipo de segmento -->
          <div
            v-if="selectedSegmento.tipo === 'transporte' && selectedSegmento.segmento_transporte"
            class="border-t pt-4"
          >
            <h3 class="text-sm font-medium text-gray-900 mb-3">Información del viaje</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-if="selectedSegmento.segmento_transporte.es_parte_escala">
                <span class="text-gray-500">Conexión:</span>
                <span class="ml-2">{{
                  selectedSegmento.segmento_transporte.es_parte_escala
                    ? 'Sí, tiene escala'
                    : 'Vuelo directo'
                }}</span>
              </div>
              <div v-if="selectedSegmento.segmento_transporte.origen" class="col-span-2">
                <span class="text-gray-500">Ruta del viaje:</span>
                <span class="ml-2 font-medium">
                  {{ selectedSegmento.segmento_transporte.origen }} →
                  {{ selectedSegmento.segmento_transporte.destino }}
                </span>
              </div>
              <div v-if="selectedSegmento.segmento_transporte.codigo_reserva">
                <span class="text-gray-500">Código de reserva:</span>
                <span class="ml-2">{{ selectedSegmento.segmento_transporte.codigo_reserva }}</span>
              </div>
              <div v-if="selectedSegmento.segmento_transporte.tiempo_escala_minutos">
                <span class="text-gray-500">Tiempo de conexión:</span>
                <span class="ml-2">
                  {{ selectedSegmento.segmento_transporte.tiempo_escala_minutos }} minutos
                </span>
              </div>
            </div>
          </div>
          <div
            v-if="selectedSegmento.tipo === 'hospedaje' && selectedSegmento.segmento_hospedaje"
            class="border-t pt-4"
          >
            <h3 class="text-sm font-medium text-gray-900 mb-3">Información del alojamiento</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Tipo de alojamiento:</span>
                <span class="ml-2 capitalize">{{
                  selectedSegmento.segmento_hospedaje.tipo_hospedaje?.replace('_', ' ')
                }}</span>
              </div>
              <div>
                <span class="text-gray-500">Estancia:</span>
                <span
                  class="ml-2"
                  v-if="selectedSegmento.fecha_inicio && selectedSegmento.fecha_fin"
                >
                  {{ formatDateRange(selectedSegmento.fecha_inicio, selectedSegmento.fecha_fin) }}
                </span>
                <span class="ml-2 text-gray-400" v-else>No especificada</span>
              </div>
            </div>
          </div>
          <div
            v-if="selectedSegmento.tipo === 'actividad' && selectedSegmento.segmento_actividad"
            class="border-t pt-4"
          >
            <h3 class="text-sm font-medium text-gray-900 mb-3">Información de la actividad</h3>
            <div class="text-sm">
              <div class="grid grid-cols-2 gap-4">
                <div v-if="selectedSegmento.segmento_actividad.duracion_horas">
                  <span class="text-gray-500">Duración estimada:</span>
                  <span class="ml-2">
                    {{ selectedSegmento.segmento_actividad.duracion_horas }} horas
                  </span>
                </div>
                <div>
                  <span class="text-gray-500">Tipo de actividad:</span>
                  <span class="ml-2 capitalize">{{
                    selectedSegmento.nombre.toLowerCase().includes('tour')
                      ? 'Tour guiado'
                      : selectedSegmento.nombre.toLowerCase().includes('excursión')
                        ? 'Excursión'
                        : 'Actividad turística'
                  }}</span>
                </div>
              </div>
              <div v-if="selectedSegmento.fecha_inicio && selectedSegmento.fecha_fin" class="mt-2">
                <span class="text-gray-500">Fecha programada:</span>
                <span class="ml-2">{{
                  formatDateRange(selectedSegmento.fecha_inicio, selectedSegmento.fecha_fin)
                }}</span>
              </div>
            </div>
          </div>
          <!-- Observaciones -->
          <div v-if="selectedSegmento.observaciones" class="border-t pt-4">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Información adicional</h3>
            <p class="text-sm text-gray-600">{{ selectedSegmento.observaciones }}</p>
          </div>
          <!-- Horarios específicos por tipo -->
          <div
            v-if="selectedSegmento.hora_inicio || selectedSegmento.hora_fin"
            class="border-t pt-4"
          >
            <h3 class="text-sm font-medium text-gray-900 mb-2">
              {{
                selectedSegmento.tipo === 'transporte'
                  ? 'Horarios del viaje'
                  : selectedSegmento.tipo === 'hospedaje'
                    ? 'Horarios de check-in/out'
                    : 'Horarios de la actividad'
              }}
            </h3>
            <div class="flex gap-6 text-sm">
              <div v-if="selectedSegmento.hora_inicio">
                <span class="text-gray-500">
                  {{
                    selectedSegmento.tipo === 'transporte'
                      ? 'Hora de salida:'
                      : selectedSegmento.tipo === 'hospedaje'
                        ? 'Check-in:'
                        : 'Hora de inicio:'
                  }}
                </span>
                <span class="ml-2">{{ selectedSegmento.hora_inicio }}</span>
              </div>
              <div v-if="selectedSegmento.hora_fin">
                <span class="text-gray-500">
                  {{
                    selectedSegmento.tipo === 'transporte'
                      ? 'Hora de llegada:'
                      : selectedSegmento.tipo === 'hospedaje'
                        ? 'Check-out:'
                        : 'Hora de fin:'
                  }}
                </span>
                <span class="ml-2">{{ selectedSegmento.hora_fin }}</span>
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
import {
  LogOut,
  PlayCircle,
  CheckCircle,
  Plane,
  Hotel,
  Activity,
  Info,
  User,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/ui/Modal.vue'
import { viajesService, type ViajeWithDetails } from '@/services/viajes.service'
import type { Segmento } from '@/services/supabase'
import { supabase } from '@/services/supabase'

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

// Estado para el modal de detalle del segmento
const showSegmentoModal = ref(false)
const selectedSegmento = ref<SegmentoUI | null>(null)

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
  console.log('🔄 Transformando viaje:', {
    id: viaje.id,
    nombre: viaje.nombre,
    estado: viaje.estado,
    hasNombre: 'nombre' in viaje,
    hasEstado: 'estado' in viaje,
  })

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

  const viajeTransformado = {
    ...viaje,
    fechaInicio: viaje.fecha_inicio,
    fechaFin: viaje.fecha_fin || viaje.fecha_inicio,
    progreso: viaje.progreso_porcentaje || 0,
    destino,
    segmentos: segmentosUI,
  }

  console.log('✅ Viaje transformado:', {
    id: viajeTransformado.id,
    nombre: viajeTransformado.nombre,
    estado: viajeTransformado.estado,
    hasNombre: 'nombre' in viajeTransformado,
    hasEstado: 'estado' in viajeTransformado,
  })

  return viajeTransformado
}

// Computed para filtrar viajes en curso
const viajesEnCurso = computed(() => {
  console.log('🔄 Computando viajesEnCurso, viajes totales:', viajes.value.length)

  const filtrados = viajes.value.filter((viaje) => {
    const estado = viaje.estado?.trim()
    const result = estado === 'en_curso' || estado === 'por_iniciar'

    console.log(`  📋 Viaje "${viaje.nombre}": estado="${estado}" -> ${result}`)

    return result
  })

  console.log('✅ Viajes en curso filtrados:', filtrados.length)

  return filtrados
})

// Computed para filtrar viajes finalizados
const viajesFinalizados = computed(() => {
  console.log('🔄 Computando viajesFinalizados, viajes totales:', viajes.value.length)

  const filtrados = viajes.value.filter((viaje) => {
    const estado = viaje.estado?.trim()
    const result = estado === 'finalizado'

    console.log(`  📋 Viaje "${viaje.nombre}": estado="${estado}" -> ${result}`)

    return result
  })

  console.log('✅ Viajes finalizados filtrados:', filtrados.length)

  return filtrados
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

  console.log('🔄 Cargando viajes del usuario:', userId)
  console.log('📊 Información del usuario:', {
    id: userId,
    email: authStore.user.email,
    identidad: authStore.user.profile.identidad,
    nombre: authStore.user.profile.nombre,
  })

  try {
    // Primero verificar directamente en viaje_viajeroz
    const { data: viajeViajeroz, error: vvError } = await supabase
      .from('viaje_viajeroz')
      .select('viaje_id, viajero_id, viajes(id, nombre, estado, fecha_inicio)')
      .eq('viajero_id', userId)

    if (!vvError && viajeViajeroz) {
      console.log('📊 Registros en viaje_viajeroz:', viajeViajeroz)
    } else {
      console.log('❌ Error consultando viaje_viajeroz:', vvError)
    }

    const result = await viajesService.getViajesByViajero(userId)

    if (result.error) {
      console.error('❌ Error cargando viajes:', result.error)
    } else {
      console.log('📦 Viajes recibidos de Supabase:', result.data?.length || 0)

      if (result.data && result.data.length > 0) {
        console.log(
          '📋 Detalle de viajes:',
          result.data.map((v) => ({
            id: v.id,
            nombre: v.nombre,
            estado: v.estado,
            fecha_inicio: v.fecha_inicio,
            segmentos: v.segmentos?.length || 0,
          })),
        )
      }

      // Debug: mostrar estado antes de transformación
      console.log(
        '🔍 Estado antes de transformación:',
        result.data?.map((v) => ({
          nombre: v.nombre,
          estado: v.estado,
          estadoType: typeof v.estado,
        })),
      )

      // Transformar los viajes de Supabase al formato de la UI
      viajes.value = (result.data || []).map(transformarViaje)

      console.log('✅ Viajes cargados y transformados:', viajes.value.length)
      console.log(
        '📋 Estados de viajes:',
        viajes.value.map((v) => ({
          nombre: v.nombre,
          estado: `"${v.estado}"`,
          trim: `"${v.estado?.trim()}"`,
        })),
      )

      // Debug: mostrar estructura completa del primer viaje
      if (viajes.value.length > 0) {
        console.log('🔍 Estructura completa del primer viaje:', viajes.value[0])
        console.log('🔍 Propiedades del primer viaje:', Object.keys(viajes.value[0]))
      }
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

const getEstadoBadgeClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'bg-orange-100 text-orange-800'
    case 'finalizado':
      return 'bg-green-100 text-green-800'
    case 'inactivo':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getEstadoText = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'En curso'
    case 'finalizado':
      return 'Completado'
    case 'inactivo':
      return 'Pendiente'
    default:
      return 'Desconocido'
  }
}

const getSegmentoIcon = (tipo: string) => {
  switch (tipo) {
    case 'transporte':
      return Plane
    case 'hospedaje':
      return Hotel
    case 'actividad':
      return Activity
    default:
      return Info
  }
}

const getSegmentoIconBg = (tipo: string) => {
  switch (tipo) {
    case 'transporte':
      return 'bg-blue-100'
    case 'hospedaje':
      return 'bg-green-100'
    case 'actividad':
      return 'bg-purple-100'
    default:
      return 'bg-gray-100'
  }
}

const getSegmentoIconColor = (tipo: string) => {
  switch (tipo) {
    case 'transporte':
      return 'text-blue-600'
    case 'hospedaje':
      return 'text-green-600'
    case 'actividad':
      return 'text-purple-600'
    default:
      return 'text-gray-600'
  }
}

const verDetalleViaje = (viaje: ViajeUI) => {
  selectedViaje.value = viaje
  showViajeModal.value = true
}

const verDetalleSegmento = (segmento: SegmentoUI) => {
  selectedSegmento.value = segmento
  showSegmentoModal.value = true
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
  console.log('🚀 ClientViajesView montado')
  await verificarUsuarioActivo()

  // Cargar viajes del usuario
  await cargarViajes()

  // Verificar estado del usuario cada 30 segundos
  statusCheckInterval = window.setInterval(async () => {
    if (authStore.isAuthenticated) {
      console.log('🔄 Verificación periódica del estado del usuario - recargando viajes')
      await verificarUsuarioActivo()
      await cargarViajes() // Recargar viajes también
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
    console.log('👀 Usuario cambió:', nuevoUsuario?.profile?.id)

    // Si no hay usuario, redirigir
    if (!nuevoUsuario) {
      console.log('❌ Usuario se deslogueó')
      router.push('/login-viajero')
      return
    }

    // Si el usuario cambió o si es la primera vez, refrescar la sesión y recargar viajes
    if (!usuarioAnterior || nuevoUsuario.id !== usuarioAnterior.id) {
      console.log('🔄 Refrescando sesión por cambio de usuario')
      await authStore.refreshSession()
      console.log('🔄 Recargando viajes por cambio de usuario')
      await cargarViajes()
    }

    // Verificar si el usuario fue desactivado
    if (nuevoUsuario.profile && nuevoUsuario.profile.activo === false) {
      console.log('❌ Usuario fue desactivado')
      alert('Tu cuenta ha sido desactivada. Contacta al administrador.')
      authStore.logout()
      router.push('/login-viajero')
    }
  },
  { deep: true },
)
</script>
