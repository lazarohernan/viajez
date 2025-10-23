import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { viajerosService } from '@/services/viajeros.service'
import type { Viajeroz } from '@/services/supabase'
import type { ViajeroFilters } from '@/services/viajeros.service'

export const useViajerosStore = defineStore('viajeros', () => {
  // Estado
  const viajeros = ref<Viajeroz[]>([])
  const currentViajero = ref<Viajeroz | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Paginación
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalCount = ref(0)
  const pageSize = ref(20)

  // Filtros
  const filters = ref<ViajeroFilters>({})

  // Getters computados
  const hasViajeros = computed(() => viajeros.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Viajeros con pasaportes próximos a vencer
  const expiringPassports = computed(() =>
    viajeros.value.filter(
      (v) =>
        v.fecha_vencimiento_pasaporte &&
        new Date(v.fecha_vencimiento_pasaporte) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ),
  )

  // Viajeros con visas próximas a vencer
  const expiringVisas = computed(() =>
    viajeros.value.filter(
      (v) =>
        v.fecha_vencimiento_visa &&
        new Date(v.fecha_vencimiento_visa) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ),
  )

  // Cumpleañeros del día
  const todayBirthdays = computed(() =>
    viajeros.value.filter((v) => {
      if (!v.fecha_nacimiento) return false
      const today = new Date().toISOString().split('T')[0].slice(5) // MM-DD
      const birthDate = v.fecha_nacimiento.slice(5) // MM-DD
      return birthDate === today
    }),
  )

  // Acciones
  const fetchViajeros = async (page = 1, search?: string) => {
    try {
      loading.value = true
      error.value = null

      const filtersToUse: ViajeroFilters = { ...filters.value }
      if (search) {
        filtersToUse.search = search
      }

      const result = await viajerosService.list(filtersToUse, page, pageSize.value)

      if (result.error) {
        error.value = result.error
        return
      }

      if (page === 1) {
        viajeros.value = result.data
      } else {
        viajeros.value.push(...result.data)
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

  const fetchViajeroById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajerosService.getById(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Viajero no encontrado'
        return null
      }

      currentViajero.value = result.data
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo viajero'
      return null
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (
    viajeroId: string,
  ): Promise<{ success: boolean; password?: string }> => {
    loading.value = true
    error.value = null

    try {
      const result = await viajerosService.resetPassword(viajeroId)

      if (result.error) {
        error.value = result.error
        return { success: false }
      }

      // Retornar la contraseña para que el componente la muestre
      return { success: true, password: result.data?.newPassword }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al resetear contraseña'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const createViajero = async (viajeroData: Parameters<typeof viajerosService.create>[0]) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajerosService.create(viajeroData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error creando viajero'
        return null
      }

      // Agregar a la lista local
      viajeros.value.unshift(result.data)

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando viajero'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateViajero = async (
    id: string,
    viajeroData: Parameters<typeof viajerosService.update>[1],
  ) => {
    try {
      loading.value = true
      error.value = null

      const result = await viajerosService.update(id, viajeroData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error actualizando viajero'
        return null
      }

      // Actualizar en la lista local
      const index = viajeros.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        viajeros.value[index] = result.data
      }

      // Actualizar currentViajero si es el mismo
      if (currentViajero.value?.id === id) {
        currentViajero.value = result.data
      }

      return result.data
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

      const result = await viajerosService.delete(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Error eliminando viajero'
        return false
      }

      // Remover de la lista local
      viajeros.value = viajeros.value.filter((v) => v.id !== id)

      // Limpiar currentViajero si es el mismo
      if (currentViajero.value?.id === id) {
        currentViajero.value = null
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando viajero'
      return false
    } finally {
      loading.value = false
    }
  }

  const toggleViajeroStatus = async (id: string): Promise<boolean> => {
    // console.log('🔄 toggleViajeroStatus called with id:', id)
    try {
      loading.value = true
      error.value = null

      // Obtener el estado actual del viajero
      const viajero = viajeros.value.find((v) => v.id === id)
      // console.log('📋 Viajero encontrado:', viajero)
      if (!viajero) {
        error.value = 'Viajero no encontrado'
        // console.log('❌ Viajero no encontrado')
        return false
      }

      const nuevoEstado = !viajero.activo
      // console.log('🔄 Estado actual:', viajero.activo, 'Nuevo estado:', nuevoEstado)

      // console.log('📡 Llamando a viajerosService.update con:', { activo: nuevoEstado })
      const result = await viajerosService.update(id, { activo: nuevoEstado })
      // console.log('📡 Resultado de update:', result)

      if (result.error || !result.data) {
        error.value = result.error || 'Error al actualizar estado del viajero'
        // console.log('❌ Error en update:', error.value)
        return false
      }

      // Actualizar en la lista local
      const index = viajeros.value.findIndex((v) => v.id === id)
      // console.log('🔄 Actualizando estado local, index:', index)
      if (index !== -1) {
        viajeros.value[index] = result.data
        // console.log('✅ Estado local actualizado:', result.data.activo)
      }

      // console.log('✅ toggleViajeroStatus completado exitosamente')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar estado del viajero'
      // console.log('❌ Error en toggleViajeroStatus:', error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchExpiringPassports = async (days = 30) => {
    try {
      loading.value = true
      const result = await viajerosService.getExpiringPassports(days)

      if (result.error) {
        error.value = result.error
        return []
      }

      return result.data
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
      const result = await viajerosService.getExpiringVisas(days)

      if (result.error) {
        error.value = result.error
        return []
      }

      return result.data
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
      const result = await viajerosService.getTodayBirthdays()

      if (result.error) {
        error.value = result.error
        return []
      }

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo cumpleaños del día'
      return []
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: ViajeroFilters) => {
    filters.value = { ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {}
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    viajeros.value = []
    currentViajero.value = null
    loading.value = false
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalCount.value = 0
    filters.value = {}
  }

  return {
    // Estado
    viajeros,
    currentViajero,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    filters,

    // Getters
    hasViajeros,
    isLoading,
    hasError,
    expiringPassports,
    expiringVisas,
    todayBirthdays,

    // Acciones
    fetchViajeros,
    fetchViajeroById,
    createViajero,
    updateViajero,
    deleteViajero,
    toggleViajeroStatus,
    resetPassword,
    fetchExpiringPassports,
    fetchExpiringVisas,
    fetchTodayBirthdays,
    setFilters,
    clearFilters,
    clearError,
    reset,
  }
})
