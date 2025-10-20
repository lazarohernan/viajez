import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { cotizacionesService } from '@/services/cotizaciones.service'
import type {
  CotizacionWithSegmentos,
  CreateCotizacionData,
  UpdateCotizacionData,
} from '@/services/cotizaciones.service'

export const useCotizacionesStore = defineStore('cotizaciones', () => {
  // Estado
  const cotizaciones = ref<CotizacionWithSegmentos[]>([])
  const currentCotizacion = ref<CotizacionWithSegmentos | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const totalCount = ref(0)
  const currentPage = ref(1)
  const stats = ref({
    total: 0,
    borrador: 0,
    enviada: 0,
    aprobada: 0,
    rechazada: 0,
  })

  // Getters computados
  const hasCotizaciones = computed(() => cotizaciones.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Cotizaciones por estado
  const borradorCotizaciones = computed(() =>
    cotizaciones.value.filter((c) => c.estado === 'borrador'),
  )
  const enviadasCotizaciones = computed(() =>
    cotizaciones.value.filter((c) => c.estado === 'enviada'),
  )
  const aprobadasCotizaciones = computed(() =>
    cotizaciones.value.filter((c) => c.estado === 'aprobada'),
  )
  const rechazadasCotizaciones = computed(() =>
    cotizaciones.value.filter((c) => c.estado === 'rechazada'),
  )

  // Acciones
  const fetchCotizaciones = async (page = 1, estado?: string) => {
    try {
      loading.value = true
      error.value = null
      currentPage.value = page

      const result = await cotizacionesService.list(page, 20, estado)

      if (result.error) {
        error.value = result.error
        return []
      }

      cotizaciones.value = result.data || []
      totalCount.value = result.count || 0

      return result.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo cotizaciones'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCotizacionById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await cotizacionesService.getById(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Cotización no encontrada'
        return null
      }

      currentCotizacion.value = result.data
      return result.data
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

      const result = await cotizacionesService.create(cotizacionData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error creando cotización'
        return null
      }

      // Agregar a la lista local
      const newCotizacion: CotizacionWithSegmentos = {
        ...result.data,
        segmentos: [],
      }
      cotizaciones.value.unshift(newCotizacion)
      currentCotizacion.value = newCotizacion

      // Actualizar stats
      await fetchStats()

      return newCotizacion
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

      const result = await cotizacionesService.update(id, cotizacionData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error actualizando cotización'
        return null
      }

      // Actualizar en la lista local
      const index = cotizaciones.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        cotizaciones.value[index] = {
          ...cotizaciones.value[index],
          ...result.data,
        }
      }

      // Actualizar currentCotizacion si es la misma
      if (currentCotizacion.value?.id === id) {
        currentCotizacion.value = {
          ...currentCotizacion.value,
          ...result.data,
        }
      }

      // Actualizar stats
      await fetchStats()

      return result.data
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

      const result = await cotizacionesService.delete(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Error eliminando cotización'
        return false
      }

      // Remover de la lista local
      cotizaciones.value = cotizaciones.value.filter((c) => c.id !== id)

      // Limpiar currentCotizacion si es la misma
      if (currentCotizacion.value?.id === id) {
        currentCotizacion.value = null
      }

      // Actualizar stats
      await fetchStats()

      return true
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

      const result = await cotizacionesService.convertToViaje(cotizacionId, viajeroId)

      if (result.error || !result.data) {
        error.value = result.error || 'Error convirtiendo cotización a viaje'
        return null
      }

      // Actualizar estado de la cotización en la lista local
      const index = cotizaciones.value.findIndex((c) => c.id === cotizacionId)
      if (index !== -1) {
        cotizaciones.value[index].estado = 'aprobada'
      }

      // Actualizar currentCotizacion si es la misma
      if (currentCotizacion.value?.id === cotizacionId) {
        currentCotizacion.value.estado = 'aprobada'
      }

      // Actualizar stats
      await fetchStats()

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error convirtiendo cotización a viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const result = await cotizacionesService.getStats()

      if (result.error || !result.data) {
        console.error('Error obteniendo estadísticas:', result.error)
        return
      }

      stats.value = result.data
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err)
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    cotizaciones.value = []
    currentCotizacion.value = null
    loading.value = false
    error.value = null
    totalCount.value = 0
    currentPage.value = 1
    stats.value = {
      total: 0,
      borrador: 0,
      enviada: 0,
      aprobada: 0,
      rechazada: 0,
    }
  }

  return {
    // Estado
    cotizaciones,
    currentCotizacion,
    loading,
    error,
    totalCount,
    currentPage,
    stats,

    // Getters
    hasCotizaciones,
    isLoading,
    hasError,
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
    fetchStats,
    clearError,
    reset,
  }
})
