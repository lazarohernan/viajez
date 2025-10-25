import { supabase } from './supabase'
import { BaseService, type ServiceResponse, type PaginatedResponse } from './base.service'
import type { Cotizacion, Segmento } from './supabase'

// Re-exportar tipos para uso en stores y composables
export type { Cotizacion, Segmento }

export interface CotizacionWithSegmentos extends Cotizacion {
  segmentos: Segmento[]
  viajero?: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
}

export interface CreateCotizacionData {
  nombre: string
  viajero_id?: string
  estado?: 'borrador' | 'enviada' | 'aprobada' | 'rechazada'
}

export interface UpdateCotizacionData extends Partial<CreateCotizacionData> {}

/**
 * Servicio para gestión de cotizaciones
 */
export class CotizacionesService extends BaseService {
  /**
   * Crear una nueva cotización
   */
  async create(data: CreateCotizacionData): Promise<ServiceResponse<Cotizacion>> {
    try {
      const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .insert(data)
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: cotizacion, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error creando cotización',
      }
    }
  }

  /**
   * Obtener cotización por ID con segmentos
   */
  async getById(id: string): Promise<ServiceResponse<CotizacionWithSegmentos>> {
    try {
      // Obtener cotización con viajero
      const { data: cotizacion, error: cotError } = await supabase
        .from('cotizaciones')
        .select(
          `
          *,
          viajero:viajeroz(id, nombre, apellido, email)
        `,
        )
        .eq('id', id)
        .single()

      if (cotError) this.handleError(cotError)

      // Obtener segmentos
      const { data: segmentos, error: segError } = await supabase
        .from('segmentos')
        .select(
          `
          id,
          tipo,
          nombre,
          proveedor,
          fecha_inicio,
          fecha_fin,
          hora_inicio,
          hora_fin,
          duracion,
          observaciones,
          orden,
          es_primero,
          es_ultimo,
          cotizacion_id,
          viaje_id,
          created_at,
          updated_at,
          segmento_transporte(*),
          segmento_hospedaje(*),
          segmento_actividad(*),
          documentos(*)
        `,
        )
        .eq('cotizacion_id', id)
        .order('orden', { ascending: true })

      if (segError) this.handleError(segError)

      const cotizacionWithSegmentos: CotizacionWithSegmentos = {
        ...cotizacion,
        segmentos: segmentos || [],
      }

      return { data: cotizacionWithSegmentos, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error obteniendo cotización',
      }
    }
  }

  /**
   * Listar cotizaciones con paginación
   */
  async list(
    page = 1,
    limit = 20,
    estado?: string,
  ): Promise<PaginatedResponse<CotizacionWithSegmentos>> {
    try {
      let query = supabase.from('cotizaciones').select(
        `
          *,
          viajero:viajeroz(id, nombre, apellido, email),
          segmentos(count)
        `,
        { count: 'exact' },
      )

      // Filtrar por estado si se especifica
      if (estado) {
        query = query.eq('estado', estado)
      }

      // Paginación
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) this.handleError(error)

      // Transformar datos para incluir conteo de segmentos
      const cotizacionesWithCount = (data || []).map((cot) => ({
        ...cot,
        segmentos: [], // Los segmentos se cargan bajo demanda
        segmentos_count: cot.segmentos?.[0]?.count || 0,
      }))

      return {
        data: cotizacionesWithCount,
        count: count || 0,
        error: null,
      }
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Error listando cotizaciones',
      }
    }
  }

  /**
   * Actualizar cotización
   */
  async update(id: string, data: UpdateCotizacionData): Promise<ServiceResponse<Cotizacion>> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: cotizacion, error } = await supabase
        .from('cotizaciones')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: cotizacion, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error actualizando cotización',
      }
    }
  }

  /**
   * Eliminar cotización
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('cotizaciones').delete().eq('id', id)

      if (error) this.handleError(error)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error eliminando cotización',
      }
    }
  }

  /**
   * Convertir cotización a viaje
   */
  async convertToViaje(cotizacionId: string, viajeroId?: string): Promise<ServiceResponse<string>> {
    try {
      const { data: cotizacion, error: cotError } = await this.getById(cotizacionId)
      if (cotError || !cotizacion) {
        return { data: null, error: 'Cotización no encontrada' }
      }

      // Determinar fechas del viaje basado en los segmentos
      const segmentos = cotizacion.segmentos
      const fechasSegmentos = segmentos
        .map((s) => s.fecha_inicio)
        .filter((f) => f)
        .sort()

      const fechaInicio = fechasSegmentos[0] || new Date().toISOString().split('T')[0]
      const fechaFin = fechasSegmentos[fechasSegmentos.length - 1] || fechaInicio

      // Crear el viaje
      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .insert({
          nombre: `Viaje desde ${cotizacion.nombre}`,
          descripcion: `Creado desde cotización ${cotizacion.nombre}`,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado: 'por_iniciar',
          progreso_porcentaje: 0,
          cotizacion_id: cotizacionId,
        })
        .select()
        .single()

      if (viajeError) this.handleError(viajeError)

      // Copiar los segmentos al viaje
      for (const segmento of segmentos) {
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

      // Actualizar estado de la cotización
      await this.update(cotizacionId, { estado: 'aprobada' })

      return { data: viaje.id, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error convirtiendo cotización a viaje',
      }
    }
  }

  /**
   * Obtener estadísticas de cotizaciones
   */
  async getStats(): Promise<
    ServiceResponse<{
      total: number
      borrador: number
      enviada: number
      aprobada: number
      rechazada: number
    }>
  > {
    try {
      const { data, error } = await supabase.from('cotizaciones').select('estado')

      if (error) this.handleError(error)

      const stats = (data || []).reduce(
        (acc, cot) => {
          acc.total++
          const estado = cot.estado as keyof typeof acc
          acc[estado] = (acc[estado] || 0) + 1
          return acc
        },
        { total: 0, borrador: 0, enviada: 0, aprobada: 0, rechazada: 0 },
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

// Instancia global del servicio de cotizaciones
export const cotizacionesService = new CotizacionesService()
