import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { segmentosService } from '@/services/segmentos.service'
import type { SegmentoWithDetails, CreateSegmentoData } from '@/services/segmentos.service'

export const useSegmentosStore = defineStore('segmentos', () => {
  // Estado
  const segmentos = ref<SegmentoWithDetails[]>([])
  const currentSegmento = ref<SegmentoWithDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados
  const hasSegmentos = computed(() => segmentos.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Segmentos por tipo
  const segmentosTransporte = computed(() => segmentos.value.filter((s) => s.tipo === 'transporte'))
  const segmentosHospedaje = computed(() => segmentos.value.filter((s) => s.tipo === 'hospedaje'))
  const segmentosActividad = computed(() => segmentos.value.filter((s) => s.tipo === 'actividad'))

  // Segmentos ordenados por fecha
  const segmentosOrdenados = computed(() =>
    [...segmentos.value].sort((a, b) => {
      const fechaA = new Date(a.fecha_inicio).getTime()
      const fechaB = new Date(b.fecha_inicio).getTime()
      return fechaA - fechaB
    }),
  )

  // Acciones
  const fetchSegmentosByCotizacion = async (cotizacionId: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.getByCotizacion(cotizacionId)

      if (result.error) {
        error.value = result.error
        return []
      }

      segmentos.value = result.data || []
      return result.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo segmentos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchSegmentosByViaje = async (viajeId: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.getByViaje(viajeId)

      if (result.error) {
        error.value = result.error
        return []
      }

      segmentos.value = result.data || []
      return result.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo segmentos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchSegmentoById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.getById(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Segmento no encontrado'
        return null
      }

      currentSegmento.value = result.data
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo segmento'
      return null
    } finally {
      loading.value = false
    }
  }

  const createSegmento = async (segmentoData: CreateSegmentoData) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.create(segmentoData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error creando segmento'
        return null
      }

      // Agregar a la lista local
      segmentos.value.push(result.data)

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando segmento'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateSegmento = async (id: string, segmentoData: Partial<CreateSegmentoData>) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.update(id, segmentoData)

      if (result.error || !result.data) {
        error.value = result.error || 'Error actualizando segmento'
        return null
      }

      // Actualizar en la lista local
      const index = segmentos.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        segmentos.value[index] = result.data
      }

      // Actualizar currentSegmento si es el mismo
      if (currentSegmento.value?.id === id) {
        currentSegmento.value = result.data
      }

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error actualizando segmento'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteSegmento = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.delete(id)

      if (result.error || !result.data) {
        error.value = result.error || 'Error eliminando segmento'
        return false
      }

      // Remover de la lista local
      segmentos.value = segmentos.value.filter((s) => s.id !== id)

      // Limpiar currentSegmento si es el mismo
      if (currentSegmento.value?.id === id) {
        currentSegmento.value = null
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando segmento'
      return false
    } finally {
      loading.value = false
    }
  }

  const reorderSegmentos = async (segmentIds: string[]) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.reorder(segmentIds)

      if (result.error || !result.data) {
        error.value = result.error || 'Error reordenando segmentos'
        return false
      }

      // Reordenar la lista local
      const reorderedSegmentos = segmentIds
        .map((id) => segmentos.value.find((s) => s.id === id))
        .filter(Boolean) as SegmentoWithDetails[]

      segmentos.value = reorderedSegmentos

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error reordenando segmentos'
      return false
    } finally {
      loading.value = false
    }
  }

  const uploadDocumento = async (segmentoId: string, file: File, nombreArchivo?: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.uploadDocument(segmentoId, file, nombreArchivo)

      if (result.error || !result.data) {
        error.value = result.error || 'Error subiendo documento'
        return null
      }

      // Agregar documento al segmento local
      const segmento = segmentos.value.find((s) => s.id === segmentoId)
      if (segmento) {
        if (!segmento.documentos) segmento.documentos = []
        segmento.documentos.push(result.data)
      }

      // Actualizar currentSegmento si es el mismo
      if (currentSegmento.value?.id === segmentoId) {
        if (!currentSegmento.value.documentos) currentSegmento.value.documentos = []
        currentSegmento.value.documentos.push(result.data)
      }

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error subiendo documento'
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteDocumento = async (documentoId: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.deleteDocument(documentoId)

      if (result.error || !result.data) {
        error.value = result.error || 'Error eliminando documento'
        return false
      }

      // Remover documento de los segmentos locales
      segmentos.value.forEach((segmento) => {
        if (segmento.documentos) {
          segmento.documentos = segmento.documentos.filter((d) => d.id !== documentoId)
        }
      })

      // Remover de currentSegmento si existe
      if (currentSegmento.value?.documentos) {
        currentSegmento.value.documentos = currentSegmento.value.documentos.filter(
          (d) => d.id !== documentoId,
        )
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando documento'
      return null
    } finally {
      loading.value = false
    }
  }

  const getDocumentos = async (segmentoId: string) => {
    try {
      loading.value = true
      const result = await segmentosService.getDocuments(segmentoId)

      if (result.error) {
        error.value = result.error
        return []
      }

      // Actualizar documentos en el segmento local
      const segmento = segmentos.value.find((s) => s.id === segmentoId)
      if (segmento) {
        segmento.documentos = result.data || []
      }

      return result.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error obteniendo documentos'
      return []
    } finally {
      loading.value = false
    }
  }

  const copySegmentoToViaje = async (segmentoId: string, viajeId: string) => {
    try {
      loading.value = true
      error.value = null

      const result = await segmentosService.copyToViaje(segmentoId, viajeId)

      if (result.error || !result.data) {
        error.value = result.error || 'Error copiando segmento'
        return null
      }

      // Agregar a la lista local si estamos viendo segmentos del viaje
      segmentos.value.push(result.data)

      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error copiando segmento'
      return null
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    segmentos.value = []
    currentSegmento.value = null
    loading.value = false
    error.value = null
  }

  return {
    // Estado
    segmentos,
    currentSegmento,
    loading,
    error,

    // Getters
    hasSegmentos,
    isLoading,
    hasError,
    segmentosTransporte,
    segmentosHospedaje,
    segmentosActividad,
    segmentosOrdenados,

    // Acciones
    fetchSegmentosByCotizacion,
    fetchSegmentosByViaje,
    fetchSegmentoById,
    createSegmento,
    updateSegmento,
    deleteSegmento,
    reorderSegmentos,
    uploadDocumento,
    deleteDocumento,
    getDocumentos,
    copySegmentoToViaje,
    clearError,
    reset,
  }
})
