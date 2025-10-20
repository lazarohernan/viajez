import { computed, ref } from 'vue'
import { useCotizacionesStore } from '@/stores/cotizaciones.store'
import type {
  CotizacionWithSegmentos,
  CreateCotizacionData,
  UpdateCotizacionData,
} from '@/services/cotizaciones.service'

export function useCotizaciones() {
  const cotizacionesStore = useCotizacionesStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados del store
  const cotizaciones = computed(() => cotizacionesStore.cotizaciones)
  const currentCotizacion = computed(() => cotizacionesStore.currentCotizacion)
  const hasCotizaciones = computed(() => cotizacionesStore.hasCotizaciones)
  const isLoading = computed(() => cotizacionesStore.isLoading || loading.value)
  const stats = computed(() => cotizacionesStore.stats)
  const borradorCotizaciones = computed(() => cotizacionesStore.borradorCotizaciones)
  const enviadasCotizaciones = computed(() => cotizacionesStore.enviadasCotizaciones)
  const aprobadasCotizaciones = computed(() => cotizacionesStore.aprobadasCotizaciones)
  const rechazadasCotizaciones = computed(() => cotizacionesStore.rechazadasCotizaciones)

  // Funciones CRUD
  const fetchCotizaciones = async (page = 1, estado?: string) => {
    try {
      loading.value = true
      error.value = null

      await cotizacionesStore.fetchCotizaciones(page, estado)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando cotizaciones'
    } finally {
      loading.value = false
    }
  }

  const fetchCotizacionById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const cotizacion = await cotizacionesStore.fetchCotizacionById(id)
      return cotizacion
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo cotización'
      return null
    } finally {
      loading.value = false
    }
  }

  const createCotizacion = async (cotizacionData: CreateCotizacionData) => {
    try {
      loading.value = true
      error.value = null

      const cotizacion = await cotizacionesStore.createCotizacion(cotizacionData)
      return cotizacion
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando cotización'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateCotizacion = async (id: string, cotizacionData: UpdateCotizacionData) => {
    try {
      loading.value = true
      error.value = null

      const cotizacion = await cotizacionesStore.updateCotizacion(id, cotizacionData)
      return cotizacion
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error actualizando cotización'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteCotizacion = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const success = await cotizacionesStore.deleteCotizacion(id)
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando cotización'
      return false
    } finally {
      loading.value = false
    }
  }

  const convertToViaje = async (cotizacionId: string, viajeroId?: string) => {
    try {
      loading.value = true
      error.value = null

      const viajeId = await cotizacionesStore.convertToViaje(cotizacionId, viajeroId)
      return viajeId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error convirtiendo cotización a viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  // Funciones específicas
  const changeEstado = async (
    id: string,
    nuevoEstado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada',
  ) => {
    return updateCotizacion(id, { estado: nuevoEstado })
  }

  const enviarCotizacion = async (id: string) => {
    return changeEstado(id, 'enviada')
  }

  const aprobarCotizacion = async (id: string) => {
    return changeEstado(id, 'aprobada')
  }

  const rechazarCotizacion = async (id: string) => {
    return changeEstado(id, 'rechazada')
  }

  // Funciones de filtrado
  const fetchCotizacionesByEstado = async (
    estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada',
  ) => {
    await fetchCotizaciones(1, estado)
  }

  const fetchCotizacionesBorrador = async () => {
    await fetchCotizacionesByEstado('borrador')
  }

  const fetchCotizacionesEnviadas = async () => {
    await fetchCotizacionesByEstado('enviada')
  }

  const fetchCotizacionesAprobadas = async () => {
    await fetchCotizacionesByEstado('aprobada')
  }

  const fetchCotizacionesRechazadas = async () => {
    await fetchCotizacionesByEstado('rechazada')
  }

  // Funciones de utilidad
  const getCotizacionById = (id: string): CotizacionWithSegmentos | undefined => {
    return cotizaciones.value.find((c) => c.id === id)
  }

  const getCotizacionesByViajero = (viajeroId: string): CotizacionWithSegmentos[] => {
    return cotizaciones.value.filter((c) => c.viajero_id === viajeroId)
  }

  const clearError = () => {
    error.value = null
    cotizacionesStore.clearError()
  }

  const reset = () => {
    cotizacionesStore.reset()
    loading.value = false
    error.value = null
  }

  return {
    // Estado
    loading: isLoading,
    error: computed(() => error.value || cotizacionesStore.error),

    // Getters del store
    cotizaciones,
    currentCotizacion,
    hasCotizaciones,
    stats,
    borradorCotizaciones,
    enviadasCotizaciones,
    aprobadasCotizaciones,
    rechazadasCotizaciones,

    // Acciones
    fetchCotizaciones,
    fetchCotizacionById,
    createCotizacion,
    updateCotizacion,
    deleteCotizacion,
    convertToViaje,
    changeEstado,
    enviarCotizacion,
    aprobarCotizacion,
    rechazarCotizacion,
    fetchCotizacionesByEstado,
    fetchCotizacionesBorrador,
    fetchCotizacionesEnviadas,
    fetchCotizacionesAprobadas,
    fetchCotizacionesRechazadas,
    getCotizacionById,
    getCotizacionesByViajero,
    clearError,
    reset,
  }
}
