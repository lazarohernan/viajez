import { computed, ref } from 'vue'
import { useViajerosStore } from '@/stores/viajeros.store'
import type { Viajeroz, CreateViajeroData, UpdateViajeroData } from '@/services/viajeros.service'
import type { ViajeroFilters } from '@/services/viajeros.service'

export function useViajeros() {
  const viajerosStore = useViajerosStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados del store
  const viajeros = computed(() => viajerosStore.viajeros)
  const currentViajero = computed(() => viajerosStore.currentViajero)
  const hasViajeros = computed(() => viajerosStore.hasViajeros)
  const isLoading = computed(() => viajerosStore.isLoading || loading.value)
  const expiringPassports = computed(() => viajerosStore.expiringPassports)
  const expiringVisas = computed(() => viajerosStore.expiringVisas)
  const todayBirthdays = computed(() => viajerosStore.todayBirthdays)

  // Funciones CRUD
  const fetchViajeros = async (page = 1, search?: string) => {
    try {
      loading.value = true
      error.value = null

      await viajerosStore.fetchViajeros(page, search)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando viajeros'
    } finally {
      loading.value = false
    }
  }

  const fetchViajeroById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const viajero = await viajerosStore.fetchViajeroById(id)
      return viajero
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viajero'
      return null
    } finally {
      loading.value = false
    }
  }

  const createViajero = async (viajeroData: CreateViajeroData) => {
    try {
      loading.value = true
      error.value = null

      const viajero = await viajerosStore.createViajero(viajeroData)
      return viajero
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando viajero'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateViajero = async (id: string, viajeroData: UpdateViajeroData) => {
    try {
      loading.value = true
      error.value = null

      const viajero = await viajerosStore.updateViajero(id, viajeroData)
      return viajero
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error actualizando viajero'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteViajero = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const success = await viajerosStore.deleteViajero(id)
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando viajero'
      return false
    } finally {
      loading.value = false
    }
  }

  // Funciones específicas
  const fetchExpiringPassports = async (days = 30) => {
    try {
      loading.value = true
      const passports = await viajerosStore.fetchExpiringPassports(days)
      return passports
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Error obteniendo pasaportes próximos a vencer'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchExpiringVisas = async (days = 30) => {
    try {
      loading.value = true
      const visas = await viajerosStore.fetchExpiringVisas(days)
      return visas
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo visas próximas a vencer'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchTodayBirthdays = async () => {
    try {
      loading.value = true
      const birthdays = await viajerosStore.fetchTodayBirthdays()
      return birthdays
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo cumpleaños del día'
      return []
    } finally {
      loading.value = false
    }
  }

  // Funciones de filtrado
  const setFilters = (filters: ViajeroFilters) => {
    viajerosStore.setFilters(filters)
  }

  const clearFilters = () => {
    viajerosStore.clearFilters()
  }

  const searchViajeros = async (searchTerm: string) => {
    await fetchViajeros(1, searchTerm)
  }

  // Funciones de utilidad
  const findViajeroByIdentity = (identidad: string): Viajeroz | undefined => {
    return viajeros.value.find((v) => v.identidad === identidad)
  }

  const getViajeroById = (id: string): Viajeroz | undefined => {
    return viajeros.value.find((v) => v.id === id)
  }

  const clearError = () => {
    error.value = null
    viajerosStore.clearError()
  }

  const reset = () => {
    viajerosStore.reset()
    loading.value = false
    error.value = null
  }

  return {
    // Estado
    loading: isLoading,
    error: computed(() => error.value || viajerosStore.error),

    // Getters del store
    viajeros,
    currentViajero,
    hasViajeros,
    expiringPassports,
    expiringVisas,
    todayBirthdays,

    // Acciones
    fetchViajeros,
    fetchViajeroById,
    createViajero,
    updateViajero,
    deleteViajero,
    fetchExpiringPassports,
    fetchExpiringVisas,
    fetchTodayBirthdays,
    setFilters,
    clearFilters,
    searchViajeros,
    findViajeroByIdentity,
    getViajeroById,
    clearError,
    reset,
  }
}
