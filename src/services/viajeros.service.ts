import { supabase } from './supabase'
import { BaseService, type ServiceResponse, type PaginatedResponse } from './base.service'
import type { Viajeroz } from './supabase'

// Re-exportar tipos para uso en stores y composables
export type { Viajeroz }

export interface ViajeroFilters {
  search?: string
  hasExpiredPassport?: boolean
  hasExpiredVisa?: boolean
}

export interface CreateViajeroData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  identidad: string
  fecha_nacimiento: string
  numero_pasaporte?: string
  fecha_vencimiento_pasaporte?: string
  numero_visa?: string
  pais_visa?: string
  tipo_visa?: string
  fecha_vencimiento_visa?: string
  pais_residencia?: string
}

export interface UpdateViajeroData extends Partial<CreateViajeroData> {}

/**
 * Servicio para gestión de viajeros (clientes)
 */
export class ViajerosService extends BaseService {
  /**
   * Crear un nuevo viajero
   */
  async create(data: CreateViajeroData): Promise<ServiceResponse<Viajeroz>> {
    try {
      const { data: viajero, error } = await supabase
        .from('viajeroz')
        .insert({
          ...data,
          fecha_nacimiento: this.formatDate(data.fecha_nacimiento),
          fecha_vencimiento_pasaporte: data.fecha_vencimiento_pasaporte
            ? this.formatDate(data.fecha_vencimiento_pasaporte)
            : undefined,
          fecha_vencimiento_visa: data.fecha_vencimiento_visa
            ? this.formatDate(data.fecha_vencimiento_visa)
            : undefined,
        })
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: viajero, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error creando viajero',
      }
    }
  }

  /**
   * Obtener viajero por ID
   */
  async getById(id: string): Promise<ServiceResponse<Viajeroz>> {
    try {
      const { data, error } = await supabase.from('viajeroz').select('*').eq('id', id).single()

      if (error) this.handleError(error)

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error obteniendo viajero',
      }
    }
  }

  /**
   * Listar viajeros con filtros y paginación
   */
  async list(filters?: ViajeroFilters, page = 1, limit = 20): Promise<PaginatedResponse<Viajeroz>> {
    try {
      let query = supabase.from('viajeroz').select('*', { count: 'exact' })

      // Aplicar filtros
      if (filters?.search) {
        query = query.or(
          `nombre.ilike.%${filters.search}%,apellido.ilike.%${filters.search}%,email.ilike.%${filters.search}%,telefono.ilike.%${filters.search}%`,
        )
      }

      // Filtro para pasaportes vencidos
      if (filters?.hasExpiredPassport) {
        query = query.lt('fecha_vencimiento_pasaporte', new Date().toISOString().split('T')[0])
      }

      // Filtro para visas vencidas
      if (filters?.hasExpiredVisa) {
        query = query.lt('fecha_vencimiento_visa', new Date().toISOString().split('T')[0])
      }

      // Paginación
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .range(from, to)
        .order('nombre', { ascending: true })

      if (error) this.handleError(error)

      return {
        data: data || [],
        count: count || 0,
        error: null,
      }
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Error listando viajeros',
      }
    }
  }

  /**
   * Actualizar viajero
   */
  async update(id: string, data: UpdateViajeroData): Promise<ServiceResponse<Viajeroz>> {
    try {
      const updateData: Record<string, unknown> = { ...data }

      // Formatear fechas si existen
      if (data.fecha_nacimiento) {
        updateData.fecha_nacimiento = this.formatDate(data.fecha_nacimiento)
      }
      if (data.fecha_vencimiento_pasaporte) {
        updateData.fecha_vencimiento_pasaporte = this.formatDate(data.fecha_vencimiento_pasaporte)
      }
      if (data.fecha_vencimiento_visa) {
        updateData.fecha_vencimiento_visa = this.formatDate(data.fecha_vencimiento_visa)
      }

      updateData.updated_at = new Date().toISOString()

      const { data: viajero, error } = await supabase
        .from('viajeroz')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: viajero, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error actualizando viajero',
      }
    }
  }

  /**
   * Eliminar viajero
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('viajeroz').delete().eq('id', id)

      if (error) this.handleError(error)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error eliminando viajero',
      }
    }
  }

  /**
   * Buscar viajeros por identidad
   */
  async findByIdentity(identidad: string): Promise<ServiceResponse<Viajeroz | null>> {
    try {
      const { data, error } = await supabase
        .from('viajeroz')
        .select('*')
        .eq('identidad', identidad)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        this.handleError(error)
      }

      return { data: data || null, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error buscando viajero',
      }
    }
  }

  /**
   * Obtener viajeros con pasaportes próximos a vencer
   */
  async getExpiringPassports(days = 30): Promise<ServiceResponse<Viajeroz[]>> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const { data, error } = await supabase
        .from('viajeroz')
        .select('*')
        .not('fecha_vencimiento_pasaporte', 'is', null)
        .lte('fecha_vencimiento_pasaporte', futureDate.toISOString().split('T')[0])
        .order('fecha_vencimiento_pasaporte', { ascending: true })

      if (error) this.handleError(error)

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error ? error.message : 'Error obteniendo pasaportes próximos a vencer',
      }
    }
  }

  /**
   * Obtener viajeros con visas próximas a vencer
   */
  async getExpiringVisas(days = 30): Promise<ServiceResponse<Viajeroz[]>> {
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)

      const { data, error } = await supabase
        .from('viajeroz')
        .select('*')
        .not('fecha_vencimiento_visa', 'is', null)
        .lte('fecha_vencimiento_visa', futureDate.toISOString().split('T')[0])
        .order('fecha_vencimiento_visa', { ascending: true })

      if (error) this.handleError(error)

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error obteniendo visas próximas a vencer',
      }
    }
  }

  /**
   * Obtener cumpleaños del día
   */
  async getTodayBirthdays(): Promise<ServiceResponse<Viajeroz[]>> {
    try {
      const today = new Date().toISOString().split('T')[0].slice(5) // MM-DD format

      const { data, error } = await supabase
        .from('viajeroz')
        .select('*')
        .filter('fecha_nacimiento', 'like', `%${today}`)

      if (error) this.handleError(error)

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error obteniendo cumpleaños del día',
      }
    }
  }
}

// Instancia global del servicio de viajeros
export const viajerosService = new ViajerosService()
