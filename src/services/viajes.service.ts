import { supabase } from './supabase'
import { BaseService, type ServiceResponse, type PaginatedResponse } from './base.service'
import type { Viaje, Segmento, Viajeroz } from './supabase'

// Re-exportar tipos para uso en stores y composables
export type { Viaje, Segmento, Viajeroz }

export interface ViajeWithDetails extends Viaje {
  segmentos: Segmento[]
  viajeros: Viajeroz[]
  cotizacion?: {
    id: string
    nombre: string
  }
}

export interface CreateViajeData {
  nombre: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin?: string
  estado?: 'por_iniciar' | 'en_curso' | 'finalizado'
  progreso_porcentaje?: number
  cotizacion_id?: string
}

export interface UpdateViajeData extends Partial<CreateViajeData> {}

/**
 * Servicio para gestión de viajes
 */
export class ViajesService extends BaseService {
  /**
   * Crear un nuevo viaje
   */
  async create(data: CreateViajeData): Promise<ServiceResponse<Viaje>> {
    try {
      const { data: viaje, error } = await supabase
        .from('viajes')
        .insert({
          ...data,
          fecha_inicio: this.formatDate(data.fecha_inicio),
          fecha_fin: data.fecha_fin ? this.formatDate(data.fecha_fin) : undefined,
        })
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: viaje, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error creando viaje',
      }
    }
  }

  /**
   * Crear viaje desde cotización
   */
  async createFromCotizacion(
    cotizacionId: string,
    viajeroId?: string,
  ): Promise<ServiceResponse<Viaje>> {
    try {
      // Obtener la cotización con segmentos
      const { data: cotizacion, error: cotError } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', cotizacionId)
        .single()

      if (cotError) this.handleError(cotError)

      // Obtener segmentos de la cotización
      const { data: segmentos, error: segError } = await supabase
        .from('segmentos')
        .select(
          `
          *,
          segmento_transporte(*),
          segmento_hospedaje(*),
          segmento_actividad(*)
        `,
        )
        .eq('cotizacion_id', cotizacionId)
        .order('orden', { ascending: true })

      if (segError) this.handleError(segError)

      // Determinar fechas del viaje basado en los segmentos
      const fechasSegmentos = (segmentos || [])
        .map((s) => s.fecha_inicio)
        .filter((f) => f)
        .sort()

      const fechaInicio = fechasSegmentos[0] || new Date().toISOString().split('T')[0]
      const fechaFin = fechasSegmentos[fechasSegmentos.length - 1] || fechaInicio

      // Crear el viaje
      const viajeData = {
        nombre: `Viaje desde ${cotizacion.nombre}`,
        descripcion: `Creado desde cotización ${cotizacion.nombre}`,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: 'por_iniciar' as const,
        progreso_porcentaje: 0,
        cotizacion_id: cotizacionId,
      }

      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .insert(viajeData)
        .select()
        .single()

      if (viajeError) this.handleError(viajeError)

      // Copiar los segmentos al viaje
      for (const segmento of segmentos || []) {
        const segmentoViajeData = {
          tipo: segmento.tipo,
          nombre: segmento.nombre,
          proveedor: segmento.proveedor,
          fecha_inicio: segmento.fecha_inicio,
          fecha_fin: segmento.fecha_fin,
          hora_inicio: segmento.hora_inicio,
          hora_fin: segmento.hora_fin,
          duracion: segmento.duracion,
          observaciones: segmento.observaciones,
          orden: segmento.orden,
          viaje_id: viaje.id,
        }

        const { error: segError } = await supabase.from('segmentos').insert(segmentoViajeData)

        if (segError) this.handleError(segError)
      }

      // Asignar viajero al viaje si se especificó
      if (viajeroId) {
        const { error: relationError } = await supabase.from('viaje_viajeroz').insert({
          viaje_id: viaje.id,
          viajero_id: viajeroId,
        })

        if (relationError) this.handleError(relationError)
      }

      return { data: viaje, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error creando viaje desde cotización',
      }
    }
  }

  /**
   * Obtener viaje por ID con todos los detalles
   */
  async getById(id: string): Promise<ServiceResponse<ViajeWithDetails>> {
    try {
      // Obtener viaje con cotización
      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .select(
          `
          *,
          cotizacion:cotizaciones(id, nombre)
        `,
        )
        .eq('id', id)
        .single()

      if (viajeError) this.handleError(viajeError)

      // Obtener segmentos
      const { data: segmentos, error: segError } = await supabase
        .from('segmentos')
        .select(
          `
          *,
          segmento_transporte(*),
          segmento_hospedaje(*),
          segmento_actividad(*),
          documentos(*)
        `,
        )
        .eq('viaje_id', id)
        .order('orden', { ascending: true })

      if (segError) this.handleError(segError)

      // Obtener viajeros
      const { data: viajeros, error: viajError } = await supabase
        .from('viaje_viajeroz')
        .select(
          `
          viajero:viajeroz(*)
        `,
        )
        .eq('viaje_id', id)

      if (viajError) this.handleError(viajError)

      const viajeWithDetails: ViajeWithDetails = {
        ...viaje,
        segmentos: segmentos || [],
        viajeros: viajeros?.map((v) => v.viajero).filter(Boolean) || [],
      }

      return { data: viajeWithDetails, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error obteniendo viaje',
      }
    }
  }

  /**
   * Listar viajes con paginación y filtros
   */
  async list(
    page = 1,
    limit = 20,
    estado?: string,
    search?: string,
  ): Promise<PaginatedResponse<ViajeWithDetails>> {
    try {
      let query = supabase.from('viajes').select(
        `
          *,
          cotizacion:cotizaciones(id, nombre),
          segmentos(count),
          viajeros:viaje_viajeroz(count)
        `,
        { count: 'exact' },
      )

      // Filtrar por estado
      if (estado) {
        query = query.eq('estado', estado)
      }

      // Búsqueda por nombre o descripción
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`)
      }

      // Paginación
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) this.handleError(error)

      // Transformar datos
      const viajesWithDetails = (data || []).map((viaje) => ({
        ...viaje,
        segmentos: [], // Se cargan bajo demanda
        viajeros: [], // Se cargan bajo demanda
        segmentos_count: viaje.segmentos?.[0]?.count || 0,
        viajeros_count: viaje.viajeros?.[0]?.count || 0,
      }))

      return {
        data: viajesWithDetails,
        count: count || 0,
        error: null,
      }
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Error listando viajes',
      }
    }
  }

  /**
   * Actualizar viaje
   */
  async update(id: string, data: UpdateViajeData): Promise<ServiceResponse<Viaje>> {
    try {
      const updateData: Record<string, unknown> = { ...data }

      if (data.fecha_inicio) {
        updateData.fecha_inicio = this.formatDate(data.fecha_inicio)
      }
      if (data.fecha_fin) {
        updateData.fecha_fin = this.formatDate(data.fecha_fin)
      }

      updateData.updated_at = new Date().toISOString()

      const { data: viaje, error } = await supabase
        .from('viajes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: viaje, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error actualizando viaje',
      }
    }
  }

  /**
   * Eliminar viaje
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('viajes').delete().eq('id', id)

      if (error) this.handleError(error)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error eliminando viaje',
      }
    }
  }

  /**
   * Agregar viajero a un viaje
   */
  async addViajero(viajeId: string, viajeroId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('viaje_viajeroz').insert({
        viaje_id: viajeId,
        viajero_id: viajeroId,
      })

      if (error) this.handleError(error)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error agregando viajero al viaje',
      }
    }
  }

  /**
   * Remover viajero de un viaje
   */
  async removeViajero(viajeId: string, viajeroId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('viaje_viajeroz')
        .delete()
        .eq('viaje_id', viajeId)
        .eq('viajero_id', viajeroId)

      if (error) this.handleError(error)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error removiendo viajero del viaje',
      }
    }
  }

  /**
   * Actualizar progreso del viaje
   */
  async updateProgress(id: string, progreso: number): Promise<ServiceResponse<Viaje>> {
    try {
      const { data: viaje, error } = await supabase
        .from('viajes')
        .update({
          progreso_porcentaje: Math.max(0, Math.min(100, progreso)),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: viaje, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error actualizando progreso',
      }
    }
  }

  /**
   * Obtener viajes próximos (próximos 30 días)
   */
  async getUpcoming(days = 30): Promise<ServiceResponse<ViajeWithDetails[]>> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const { data, error } = await supabase
        .from('viajes')
        .select(
          `
          *,
          cotizacion:cotizaciones(id, nombre)
        `,
        )
        .eq('estado', 'por_iniciar')
        .gte('fecha_inicio', new Date().toISOString().split('T')[0])
        .lte('fecha_inicio', futureDate.toISOString().split('T')[0])
        .order('fecha_inicio', { ascending: true })

      if (error) this.handleError(error)

      // Para cada viaje, obtener segmentos y viajeros
      const viajesWithDetails = await Promise.all(
        (data || []).map(async (viaje) => {
          const [segmentosResult, viajerosResult] = await Promise.all([
            supabase
              .from('segmentos')
              .select('*')
              .eq('viaje_id', viaje.id)
              .order('orden', { ascending: true }),
            supabase.from('viaje_viajeroz').select('viajero:viajeroz(*)').eq('viaje_id', viaje.id),
          ])

          return {
            ...viaje,
            segmentos: segmentosResult.data || [],
            viajeros: viajerosResult.data?.map((v) => v.viajero).filter(Boolean) || [],
          }
        }),
      )

      return { data: viajesWithDetails, error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error obteniendo viajes próximos',
      }
    }
  }

  /**
   * Obtener viajes en curso y por iniciar (viajes activos)
   */
  async getInProgress(): Promise<ServiceResponse<ViajeWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('viajes')
        .select(
          `
          *,
          cotizacion:cotizaciones(id, nombre)
        `,
        )
        .in('estado', ['en_curso', 'por_iniciar'])
        .order('fecha_inicio', { ascending: true })

      if (error) this.handleError(error)

      const viajesWithDetails = await Promise.all(
        (data || []).map(async (viaje) => {
          const [segmentosResult, viajerosResult] = await Promise.all([
            supabase
              .from('segmentos')
              .select('*')
              .eq('viaje_id', viaje.id)
              .order('orden', { ascending: true }),
            supabase.from('viaje_viajeroz').select('viajero:viajeroz(*)').eq('viaje_id', viaje.id),
          ])

          return {
            ...viaje,
            segmentos: segmentosResult.data || [],
            viajeros: viajerosResult.data?.map((v) => v.viajero).filter(Boolean) || [],
          }
        }),
      )

      return { data: viajesWithDetails, error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error obteniendo viajes en curso',
      }
    }
  }

  /**
   * Obtener estadísticas de viajes
   */
  async getStats(): Promise<
    ServiceResponse<{
      total: number
      por_iniciar: number
      en_curso: number
      finalizado: number
    }>
  > {
    try {
      const { data, error } = await supabase.from('viajes').select('estado')

      if (error) this.handleError(error)

      const stats = (data || []).reduce(
        (acc, viaje) => {
          acc.total++
          const estado = viaje.estado as keyof typeof acc
          acc[estado] = (acc[estado] || 0) + 1
          return acc
        },
        { total: 0, por_iniciar: 0, en_curso: 0, finalizado: 0 },
      )

      return { data: stats, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error obteniendo estadísticas',
      }
    }
  }
}

// Instancia global del servicio de viajes
export const viajesService = new ViajesService()
