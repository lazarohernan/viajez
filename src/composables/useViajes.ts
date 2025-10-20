import { computed, ref } from 'vue'
import { useViajesStore } from '@/stores/viajes.store'
import type { ViajeWithDetails, CreateViajeData, UpdateViajeData } from '@/services/viajes.service'

export function useViajes() {
  const viajesStore = useViajesStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados del store
  const viajes = computed(() => viajesStore.viajes)
  const currentViaje = computed(() => viajesStore.currentViaje)
  const hasViajes = computed(() => viajesStore.hasViajes)
  const isLoading = computed(() => viajesStore.isLoading || loading.value)
  const stats = computed(() => viajesStore.stats)
  const viajesPorIniciar = computed(() => viajesStore.viajesPorIniciar)
  const viajesEnCurso = computed(() => viajesStore.viajesEnCurso)
  const viajesFinalizados = computed(() => viajesStore.viajesFinalizados)
  const viajesProximos = computed(() => viajesStore.viajesProximos)

  // Funciones CRUD
  const fetchViajes = async (page = 1, estado?: string, search?: string) => {
    try {
      loading.value = true
      error.value = null

      await viajesStore.fetchViajes(page, estado, search)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando viajes'
    } finally {
      loading.value = false
    }
  }

  const fetchViajeById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const viaje = await viajesStore.fetchViajeById(id)
      return viaje
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viaje'
      return null
    } finally {
      loading.value = false
    }
  }

  const createViaje = async (viajeData: CreateViajeData) => {
    try {
      loading.value = true
      error.value = null

      const viaje = await viajesStore.createViaje(viajeData)
      return viaje
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

      const viaje = await viajesStore.createViajeFromCotizacion(cotizacionId, viajeroId)
      return viaje
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando viaje desde cotización'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateViaje = async (id: string, viajeData: UpdateViajeData) => {
    try {
      loading.value = true
      error.value = null

      const viaje = await viajesStore.updateViaje(id, viajeData)
      return viaje
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

      const success = await viajesStore.deleteViaje(id)
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando viaje'
      return false
    } finally {
      loading.value = false
    }
  }

  // Funciones de gestión de viajeros en viajes
  const addViajeroToViaje = async (viajeId: string, viajeroId: string) => {
    try {
      loading.value = true
      error.value = null

      const success = await viajesStore.addViajeroToViaje(viajeId, viajeroId)
      return success
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

      const success = await viajesStore.removeViajeroFromViaje(viajeId, viajeroId)
      return success
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

      const viaje = await viajesStore.updateProgress(id, progreso)
      return viaje
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error actualizando progreso'
      return null
    } finally {
      loading.value = false
    }
  }

  // Funciones específicas
  const changeEstado = async (
    id: string,
    nuevoEstado: 'por_iniciar' | 'en_curso' | 'finalizado',
  ) => {
    return updateViaje(id, { estado: nuevoEstado })
  }

  const iniciarViaje = async (id: string) => {
    return changeEstado(id, 'en_curso')
  }

  const finalizarViaje = async (id: string) => {
    return updateViaje(id, { estado: 'finalizado', progreso_porcentaje: 100 })
  }

  // Funciones de filtrado
  const fetchViajesByEstado = async (estado: 'por_iniciar' | 'en_curso' | 'finalizado') => {
    await fetchViajes(1, estado)
  }

  const fetchViajesPorIniciar = async () => {
    await fetchViajesByEstado('por_iniciar')
  }

  const fetchViajesEnCurso = async () => {
    await fetchViajesByEstado('en_curso')
  }

  const fetchViajesFinalizados = async () => {
    await fetchViajesByEstado('finalizado')
  }

  const fetchViajesProximos = async (days = 30) => {
    try {
      loading.value = true
      const proximosViajes = await viajesStore.fetchViajesProximos(days)
      return proximosViajes
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viajes próximos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchViajesEnCursoActivos = async () => {
    try {
      loading.value = true
      const viajesActivos = await viajesStore.fetchViajesEnCurso()
      return viajesActivos
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viajes en curso'
      return []
    } finally {
      loading.value = false
    }
  }

  // Funciones de búsqueda
  const searchViajes = async (searchTerm: string) => {
    await fetchViajes(1, undefined, searchTerm)
  }

  // Funciones de utilidad
  const getViajeById = (id: string): ViajeWithDetails | undefined => {
    return viajes.value.find((v) => v.id === id)
  }

  const getViajesByCotizacion = (cotizacionId: string): ViajeWithDetails[] => {
    return viajes.value.filter((v) => v.cotizacion_id === cotizacionId)
  }

  const getViajesByViajero = (viajeroId: string): ViajeWithDetails[] => {
    return viajes.value.filter((v) => v.viajeros.some((viajero) => viajero.id === viajeroId))
  }

  const clearError = () => {
    error.value = null
    viajesStore.clearError()
  }

  const reset = () => {
    viajesStore.reset()
    loading.value = false
    error.value = null
  }

  return {
    // Estado
    loading: isLoading,
    error: computed(() => error.value || viajesStore.error),

    // Getters del store
    viajes,
    currentViaje,
    hasViajes,
    stats,
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
    changeEstado,
    iniciarViaje,
    finalizarViaje,
    fetchViajesByEstado,
    fetchViajesPorIniciar,
    fetchViajesEnCurso,
    fetchViajesFinalizados,
    fetchViajesProximos,
    fetchViajesEnCursoActivos,
    searchViajes,
    getViajeById,
    getViajesByCotizacion,
    getViajesByViajero,
    clearError,
    reset,
  }
}
