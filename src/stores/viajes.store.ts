import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { viajesService } from '@/services/viajes.service'
import type { ViajeWithDetails } from '@/services/viajes.service'
import type { Viaje } from '@/services/supabase'

export const useViajesStore = defineStore('viajes', () => {
  // Estado
  const viajes = ref<ViajeWithDetails[]>([])
  const currentViaje = ref<ViajeWithDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Paginación
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalCount = ref(0)
  const pageSize = ref(20)

  // Estadísticas
  const stats = ref({
    total: 0,
    por_iniciar: 0,
    en_curso: 0,
    finalizado: 0,
  })

  // Getters computados
  const hasViajes = computed(() => viajes.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Viajes por estado
  const viajesPorIniciar = computed(() => viajes.value.filter((v) => v.estado === 'por_iniciar'))
  const viajesEnCurso = computed(() => viajes.value.filter((v) => v.estado === 'en_curso'))
  const viajesFinalizados = computed(() => viajes.value.filter((v) => v.estado === 'finalizado'))

  // Viajes próximos (próximos 30 días)
  const viajesProximos = computed(() =>
    viajes.value.filter((v) => {
      if (!v.fecha_inicio) return false
      const fechaInicio = new Date(v.fecha_inicio)
      const now = new Date()
      const treintaDias = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      return fechaInicio >= now && fechaInicio <= treintaDias && v.estado === 'por_iniciar'
    }),
  )

  // Acciones
  const fetchViajes = async (page = 1, estado?: string, search?: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.list(page, pageSize.value, estado, search)

      if (result.error) {
        error.value = result.error
        return
      }

      if (page === 1) {
        viajes.value = result.data
      } else {
        viajes.value.push(...result.data)
      }

      currentPage.value = page
      totalCount.value = result.count
      totalPages.value = Math.ceil(result.count / pageSize.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
    } finally {
      loading.value = false
    }
  }

  const fetchViajeById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.getById(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Viaje no encontrado'
        return null
      }

      currentViaje.value = result.data
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const createViaje = async (viajeData: Parameters<typeof viajesService.create>[0]) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.create(viajeData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error creando viaje'
        return null
      }

      // Agregar a la lista local (con estructura completa)
      const viajeCompleto: ViajeWithDetails = {
        ...result.data,
        segmentos: [],
        viajeros: [],
      }
      viajes.value.unshift(viajeCompleto)

      // Actualizar estadísticas
      await fetchStats()

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const createViajeFromCotizacion = async (cotizacionId: string, viajeroId?: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.createFromCotizacion(cotizacionId, viajeroId)

      if (result.error || !result.data) {
        error.value = result.error || 'Error creando viaje desde cotización'
        return null
      }

      // Obtener el viaje completo con detalles
      const viajeResult = await viajesService.getById(result.data.id)
      if (viajeResult.data) {
        viajes.value.unshift(viajeResult.data)
        currentViaje.value = viajeResult.data
      }

      // Actualizar estadísticas
      await fetchStats()

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando viaje desde cotización'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateViaje = async (id: string, viajeData: Parameters<typeof viajesService.update>[1]) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.update(id, viajeData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error actualizando viaje'
        return null
      }

      // Actualizar en la lista local
      const index = viajes.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        viajes.value[index] = { ...viajes.value[index], ...result.data }
      }

      // Actualizar currentViaje si es el mismo
      if (currentViaje.value?.id === id) {
        currentViaje.value = { ...currentViaje.value, ...result.data }
      }

      // Actualizar estadísticas
      await fetchStats()

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error actualizando viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteViaje = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.delete(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Error eliminando viaje'
        return false
      }

      // Remover de la lista local
      viajes.value = viajes.value.filter((v) => v.id !== id)

      // Limpiar currentViaje si es el mismo
      if (currentViaje.value?.id === id) {
        currentViaje.value = null
      }

      // Actualizar estadísticas
      await fetchStats()

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando viaje'
      return false
    } finally {
      loading.value = false
    }
  }

  const addViajeroToViaje = async (viajeId: string, viajeroId: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.addViajero(viajeId, viajeroId)

      if (result.error || !result.data) {
        error.value = result.error || 'Error agregando viajero al viaje'
        return false
      }

      // Actualizar el viaje local si está cargado
      if (currentViaje.value?.id === viajeId) {
        await fetchViajeById(viajeId) // Recargar para obtener datos actualizados
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error agregando viajero al viaje'
      return false
    } finally {
      loading.value = false
    }
  }

  const removeViajeroFromViaje = async (viajeId: string, viajeroId: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.removeViajero(viajeId, viajeroId)

      if (result.error || !result.data) {
        error.value = result.error || 'Error removiendo viajero del viaje'
        return false
      }

      // Actualizar el viaje local si está cargado
      if (currentViaje.value?.id === viajeId) {
        currentViaje.value.viajeros = currentViaje.value.viajeros.filter((v) => v.id !== viajeroId)
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error removiendo viajero del viaje'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateProgress = async (id: string, progreso: number) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajesService.updateProgress(id, progreso)

      if (result.error || !result.data) {
        error.value = result.error || 'Error actualizando progreso'
        return null
      }

      // Actualizar en la lista local
      const index = viajes.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        viajes.value[index] = { ...viajes.value[index], ...result.data }
      }

      // Actualizar currentViaje si es el mismo
      if (currentViaje.value?.id === id) {
        currentViaje.value = { ...currentViaje.value, ...result.data }
      }

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error actualizando progreso'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchViajesProximos = async (days = 30) => {
    try {
      loading.value = true
      const result = await viajesService.getUpcoming(days)

      if (result.error) {
        error.value = result.error
        return []
      }

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viajes próximos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchViajesEnCurso = async () => {
    try {
      loading.value = true
      const result = await viajesService.getInProgress()

      if (result.error) {
        error.value = result.error
        return []
      }

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viajes en curso'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const result = await viajesService.getStats()

      if (result.error || !result.data) {
        console.error('Error obteniendo estadísticas:', result.error)
        return
      }

      stats.value = result.data
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err)
    }
  }

  const changeEstado = async (id: string, nuevoEstado: Viaje['estado']) => {
    return updateViaje(id, { estado: nuevoEstado })
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    viajes.value = []
    currentViaje.value = null
    loading.value = false
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalCount.value = 0
    stats.value = {
      total: 0,
      por_iniciar: 0,
      en_curso: 0,
      finalizado: 0,
    }
  }

  // Inicializar estadísticas
  fetchStats()

  return {
    // Estado
    viajes,
    currentViaje,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    stats,

    // Getters
    hasViajes,
    isLoading,
    hasError,
    viajesPorIniciar,
    viajesEnCurso,
    viajesFinalizados,
    viajesProximos,

    // Acciones
    fetchViajes,
    fetchViajeById,
    createViaje,
    createViajeFromCotizacion,
    updateViaje,
    deleteViaje,
    addViajeroToViaje,
    removeViajeroFromViaje,
    updateProgress,
    fetchViajesProximos,
    fetchViajesEnCurso,
    fetchStats,
    changeEstado,
    clearError,
    reset,
  }
})
