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
  telefono: string
  email?: string
  identidad?: string
  fecha_nacimiento?: string
  numero_pasaporte?: string
  fecha_vencimiento_pasaporte?: string
  numero_visa?: string
  pais_visa?: string
  tipo_visa?: string
  fecha_vencimiento_visa?: string
  pais_residencia?: string
  activo?: boolean
  password?: string // Contraseña para crear credenciales de acceso
  crear_credenciales?: boolean // Flag para indicar si se deben crear credenciales
}

export interface UpdateViajeroData extends Partial<CreateViajeroData> {}

/**
 * Servicio para gestión de viajeros (clientes)
 */
export class ViajerosService extends BaseService {
  async create(data: CreateViajeroData): Promise<ServiceResponse<Viajeroz>> {
    try {
      // Validar que tenga email si se van a crear credenciales
      if (data.crear_credenciales && !data.email) {
        return {
          data: null,
          error: 'Se requiere email para crear credenciales de acceso',
        }
      }

      // Validar que tenga contraseña si se van a crear credenciales
      if (data.crear_credenciales && !data.password) {
        return {
          data: null,
          error: 'Se requiere contraseña para crear credenciales de acceso',
        }
      }

      // Validar formato de identidad hondureña (XXXX-XXXX-XXXXX)
      if (data.identidad) {
        const identidadRegex = /^\d{4}-\d{4}-\d{5}$/
        if (!identidadRegex.test(data.identidad)) {
          return {
            data: null,
            error: 'La identidad debe tener el formato XXXX-XXXX-XXXXX',
          }
        }
      }

      // Validar campos obligatorios según la base de datos
      if (!data.email) {
        return {
          data: null,
          error: 'El email es obligatorio',
        }
      }

      if (!data.identidad) {
        return {
          data: null,
          error: 'La identidad es obligatoria',
        }
      }

      if (!data.fecha_nacimiento) {
        return {
          data: null,
          error: 'La fecha de nacimiento es obligatoria',
        }
      }

      // Crear el viajero en la base de datos
      const { data: viajero, error } = await supabase
        .from('viajeroz')
        .insert({
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
          email: data.email,
          identidad: data.identidad,
          fecha_nacimiento: this.formatDate(data.fecha_nacimiento),
          numero_pasaporte: data.numero_pasaporte || null,
          fecha_vencimiento_pasaporte: data.fecha_vencimiento_pasaporte
            ? this.formatDate(data.fecha_vencimiento_pasaporte)
            : null,
          numero_visa: data.numero_visa || null,
          pais_visa: data.pais_visa || null,
          tipo_visa: data.tipo_visa || null,
          fecha_vencimiento_visa: data.fecha_vencimiento_visa
            ? this.formatDate(data.fecha_vencimiento_visa)
            : null,
          pais_residencia: data.pais_residencia || null,
        })
        .select()
        .single()

      if (error) {
        // Manejar errores específicos de restricciones únicas
        if (error.code === '23505') {
          if (error.message.includes('viajeroz_identidad_key')) {
            this.handleError(
              new Error(`⚠️ Cliente ya ingresado en el sistema con la identidad ${data.identidad}`),
            )
          } else if (error.message.includes('viajeroz_email_key')) {
            this.handleError(
              new Error(`⚠️ Cliente ya ingresado en el sistema con el email ${data.email}`),
            )
          } else {
            this.handleError(new Error('⚠️ Cliente ya ingresado en el sistema con estos datos'))
          }
        } else {
          this.handleError(error)
        }
      }

      // Si se deben crear credenciales, crear usuario en Supabase Auth
      if (data.crear_credenciales && viajero && data.email && data.password) {
        try {
          // Intentar usar función RPC para crear usuario
          const { data: rpcResult, error: rpcError } = await supabase.rpc('create_viajero_user', {
            user_email: data.email,
            user_password: data.password,
            viajero_id: viajero.id,
          })

          if (rpcError) {
            console.warn('⚠️ Función RPC no disponible, creando solo viajero:', rpcError.message)
            // No fallar si la función RPC no existe, solo crear el viajero
            return {
              data: viajero,
              error: null, // No mostrar error si el viajero se creó correctamente
            }
          }

          // Verificar resultado de la función
          if (rpcResult && !rpcResult.success) {
            // console.warn('⚠️ Error en función RPC, pero viajero creado:', rpcResult.error)
            return {
              data: viajero,
              error: null, // No mostrar error si el viajero se creó correctamente
            }
          }

          // console.log('✅ Credenciales creadas exitosamente para:', data.email)
        } catch (authError) {
          console.warn(
            '⚠️ Error en proceso de creación de credenciales, pero viajero creado:',
            authError,
          )
          // No fallar si hay error en credenciales, el viajero ya se creó
          return {
            data: viajero,
            error: null, // No mostrar error si el viajero se creó correctamente
          }
        }
      }

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

  async update(id: string, data: UpdateViajeroData): Promise<ServiceResponse<Viajeroz>> {
    // console.log('🔄 ViajerosService.update called with:', { id, data })
    try {
      const updateData: Record<string, unknown> = {}

      // Solo incluir campos que no sean undefined
      if (data.nombre !== undefined) updateData.nombre = data.nombre
      if (data.apellido !== undefined) updateData.apellido = data.apellido
      if (data.telefono !== undefined) updateData.telefono = data.telefono
      if (data.email !== undefined) updateData.email = data.email || null
      if (data.identidad !== undefined) updateData.identidad = data.identidad || null
      if (data.fecha_nacimiento !== undefined)
        updateData.fecha_nacimiento = data.fecha_nacimiento
          ? this.formatDate(data.fecha_nacimiento)
          : null
      if (data.numero_pasaporte !== undefined)
        updateData.numero_pasaporte = data.numero_pasaporte || null
      if (data.fecha_vencimiento_pasaporte !== undefined)
        updateData.fecha_vencimiento_pasaporte = data.fecha_vencimiento_pasaporte
          ? this.formatDate(data.fecha_vencimiento_pasaporte)
          : null
      if (data.numero_visa !== undefined) updateData.numero_visa = data.numero_visa || null
      if (data.pais_visa !== undefined) updateData.pais_visa = data.pais_visa || null
      if (data.tipo_visa !== undefined) updateData.tipo_visa = data.tipo_visa || null
      if (data.fecha_vencimiento_visa !== undefined)
        updateData.fecha_vencimiento_visa = data.fecha_vencimiento_visa
          ? this.formatDate(data.fecha_vencimiento_visa)
          : null
      if (data.pais_residencia !== undefined)
        updateData.pais_residencia = data.pais_residencia || null
      if (data.activo !== undefined) updateData.activo = data.activo

      updateData.updated_at = new Date().toISOString()

      // console.log('📡 Sending update to Supabase:', updateData)
      const { data: viajero, error } = await supabase
        .from('viajeroz')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      // console.log('📡 Supabase response:', { viajero, error })
      if (error) {
        console.error('❌ Error from Supabase:', error)
        this.handleError(error)
      }

      return { data: viajero, error: null }
    } catch (error) {
      console.error('❌ Exception in update:', error)
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

  /**
   * Resetear contraseña de un viajero
   */
  async resetPassword(viajeroId: string): Promise<ServiceResponse<{ newPassword: string }>> {
    try {
      // Generar nueva contraseña aleatoria
      const newPassword = this.generateRandomPassword()

      // Buscar el email del viajero
      const { data: viajero, error: findError } = await supabase
        .from('viajeroz')
        .select('email')
        .eq('id', viajeroId)
        .single()

      if (findError || !viajero?.email) {
        return {
          data: null,
          error: 'Viajero no encontrado o sin email registrado',
        }
      }

      // Usar función RPC para resetear contraseña
      const { data: rpcResult, error: rpcError } = await supabase.rpc('reset_viajero_password', {
        viajero_id_param: viajeroId,
        new_password: newPassword,
      })

      if (rpcError) {
        console.error('Error en RPC reset_viajero_password:', rpcError)
        return {
          data: null,
          error: 'Error al actualizar la contraseña',
        }
      }

      // Verificar resultado de la función
      if (rpcResult && !rpcResult.success) {
        console.error('Error en función RPC:', rpcResult.error)
        return {
          data: null,
          error: rpcResult.error || 'Error al actualizar la contraseña',
        }
      }

      // console.log('✅ Contraseña reseteada exitosamente para:', viajero.email)
      return { data: { newPassword }, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al resetear contraseña',
      }
    }
  }

  /**
   * Generar contraseña aleatoria segura
   */
  private generateRandomPassword(): string {
    const length = 10
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return password
  }
}

// Instancia global del servicio de viajeros
export const viajerosService = new ViajerosService()
