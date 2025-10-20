import { computed, ref } from 'vue'
import { useSegmentosStore } from '@/stores/segmentos.store'
import type { SegmentoWithDetails, CreateSegmentoData } from '@/services/segmentos.service'
import type { Documento } from '@/services/supabase'

export function useSegmentos() {
  const segmentosStore = useSegmentosStore()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados del store
  const segmentos = computed(() => segmentosStore.segmentos)
  const currentSegmento = computed(() => segmentosStore.currentSegmento)
  const hasSegmentos = computed(() => segmentosStore.hasSegmentos)
  const isLoading = computed(() => segmentosStore.isLoading || loading.value)
  const segmentosTransporte = computed(() => segmentosStore.segmentosTransporte)
  const segmentosHospedaje = computed(() => segmentosStore.segmentosHospedaje)
  const segmentosActividad = computed(() => segmentosStore.segmentosActividad)
  const segmentosOrdenados = computed(() => segmentosStore.segmentosOrdenados)

  // Funciones CRUD
  const fetchSegmentosByCotizacion = async (cotizacionId: string) => {
    try {
      loading.value = true
      error.value = null

      const segmentosData = await segmentosStore.fetchSegmentosByCotizacion(cotizacionId)
      return segmentosData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando segmentos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchSegmentosByViaje = async (viajeId: string) => {
    try {
      loading.value = true
      error.value = null

      const segmentosData = await segmentosStore.fetchSegmentosByViaje(viajeId)
      return segmentosData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando segmentos'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchSegmentoById = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const segmento = await segmentosStore.fetchSegmentoById(id)
      return segmento
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

      const segmento = await segmentosStore.createSegmento(segmentoData)
      return segmento
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

      const segmento = await segmentosStore.updateSegmento(id, segmentoData)
      return segmento
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

      const success = await segmentosStore.deleteSegmento(id)
      return success
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

      const success = await segmentosStore.reorderSegmentos(segmentIds)
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error reordenando segmentos'
      return false
    } finally {
      loading.value = false
    }
  }

  // Funciones de documentos
  const uploadDocumento = async (segmentoId: string, file: File, nombreArchivo?: string) => {
    try {
      loading.value = true
      error.value = null

      const documento = await segmentosStore.uploadDocumento(segmentoId, file, nombreArchivo)
      return documento
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

      const success = await segmentosStore.deleteDocumento(documentoId)
      return success
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando documento'
      return false
    } finally {
      loading.value = false
    }
  }

  const getDocumentos = async (segmentoId: string) => {
    try {
      loading.value = true
      const documentos = await segmentosStore.getDocumentos(segmentoId)
      return documentos
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

      const segmento = await segmentosStore.copySegmentoToViaje(segmentoId, viajeId)
      return segmento
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error copiando segmento'
      return null
    } finally {
      loading.value = false
    }
  }

  // Funciones de utilidad
  const getSegmentoById = (id: string): SegmentoWithDetails | undefined => {
    return segmentos.value.find((s) => s.id === id)
  }

  const getSegmentosByTipo = (tipo: 'transporte' | 'hospedaje' | 'actividad') => {
    switch (tipo) {
      case 'transporte':
        return segmentosTransporte.value
      case 'hospedaje':
        return segmentosHospedaje.value
      case 'actividad':
        return segmentosActividad.value
      default:
        return []
    }
  }

  const getDocumentosBySegmento = (segmentoId: string): Documento[] => {
    const segmento = getSegmentoById(segmentoId)
    return segmento?.documentos || []
  }

  // Funciones de creación rápida por tipo
  const createTransporteSegmento = async (
    baseData: Omit<CreateSegmentoData, 'tipo' | 'transporte'>,
    transporteData: CreateSegmentoData['transporte'],
  ) => {
    return createSegmento({
      ...baseData,
      tipo: 'transporte',
      transporte: transporteData,
    })
  }

  const createHospedajeSegmento = async (
    baseData: Omit<CreateSegmentoData, 'tipo' | 'hospedaje'>,
    hospedajeData: CreateSegmentoData['hospedaje'],
  ) => {
    return createSegmento({
      ...baseData,
      tipo: 'hospedaje',
      hospedaje: hospedajeData,
    })
  }

  const createActividadSegmento = async (
    baseData: Omit<CreateSegmentoData, 'tipo' | 'actividad'>,
    actividadData: CreateSegmentoData['actividad'],
  ) => {
    return createSegmento({
      ...baseData,
      tipo: 'actividad',
      actividad: actividadData,
    })
  }

  const clearError = () => {
    error.value = null
    segmentosStore.clearError()
  }

  const reset = () => {
    segmentosStore.reset()
    loading.value = false
    error.value = null
  }

  return {
    // Estado
    loading: isLoading,
    error: computed(() => error.value || segmentosStore.error),

    // Getters del store
    segmentos,
    currentSegmento,
    hasSegmentos,
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
    getSegmentoById,
    getSegmentosByTipo,
    getDocumentosBySegmento,
    createTransporteSegmento,
    createHospedajeSegmento,
    createActividadSegmento,
    clearError,
    reset,
  }
}
