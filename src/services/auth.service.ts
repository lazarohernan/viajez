import { supabase } from './supabase'
import { BaseService, type ServiceResponse } from './base.service'
import type { User, Session } from '@supabase/supabase-js'
import type { Viajeroz } from './supabase'

export interface AuthUser extends User {
  profile?: Viajeroz
}

export interface LoginCredentials {
  email?: string
  password?: string
  identidad?: string
}

export interface SignUpData {
  nombre: string
  apellido: string
  email: string
  telefono: string
  identidad: string
  fecha_nacimiento: string
}

/**
 * Servicio de autenticación personalizado
 * Maneja login/logout y gestión de sesiones
 */
export class AuthService extends BaseService {
  /**
   * Login para admin (email) o cliente (DNI)
   */
  async login(credentials: LoginCredentials): Promise<ServiceResponse<AuthUser>> {
    try {
      // Validar que se proporcionen credenciales
      if (!credentials.password) {
        return {
          data: null,
          error: 'Por favor proporcione una contraseña.',
        }
      }

      let emailToLogin: string

      // Determinar si es login de admin o cliente
      if (credentials.email) {
        // Login de administrador con email directo
        emailToLogin = credentials.email
      } else if (credentials.identidad) {
        // Login de cliente - buscar email por DNI
        const { data: viajero, error: viajeroError } = await supabase
          .from('viajeroz')
          .select('email')
          .eq('identidad', credentials.identidad)
          .maybeSingle()

        if (viajeroError || !viajero) {
          return {
            data: null,
            error: 'DNI no encontrado. Verifique sus credenciales.',
          }
        }

        emailToLogin = viajero.email
      } else {
        return {
          data: null,
          error: 'Por favor proporcione email o DNI para iniciar sesión.',
        }
      }

      // Intentar login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: credentials.password,
      })

      if (error) {
        return { data: null, error: 'Email o contraseña incorrectos.' }
      }

      if (!data.user) {
        return { data: null, error: 'Error obteniendo información del usuario.' }
      }

      // Obtener perfil del viajero si existe (para clientes)
      const { data: profile } = await supabase
        .from('viajeroz')
        .select('*')
        .eq('email', emailToLogin)
        .maybeSingle()

      const authUser: AuthUser = Object.assign({}, data.user, {
        profile: profile || undefined,
      })

      return { data: authUser, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error en login',
      }
    }
  }

  /**
   * Registro de nuevo viajero
   */
  async signUp(userData: SignUpData): Promise<ServiceResponse<AuthUser>> {
    try {
      // Crear el viajero primero
      const { data: viajero, error: viajeroError } = await supabase
        .from('viajeroz')
        .insert({
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          telefono: userData.telefono,
          identidad: userData.identidad,
          fecha_nacimiento: userData.fecha_nacimiento,
        })
        .select()
        .single()

      if (viajeroError) {
        return { data: null, error: viajeroError.message }
      }

      // Enviar email de confirmación
      const { data, error } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          data: {
            viajero_id: viajero.id,
            nombre: userData.nombre,
            apellido: userData.apellido,
          },
        },
      })

      if (error) {
        return { data: null, error: error.message }
      }

      if (!data.user) {
        return { data: null, error: 'No se pudo obtener la información del usuario' }
      }

      const user = data.user
      const authUser: AuthUser = Object.assign({}, user, { profile: viajero })

      return { data: authUser, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error en registro',
      }
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { data: false, error: error.message }
      }
      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error en logout',
      }
    }
  }

  /**
   * Obtener sesión actual simplificada
   */
  async getCurrentSession(): Promise<
    ServiceResponse<{ session: Session | null; user: AuthUser | null }>
  > {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        return { data: { session: null, user: null }, error: error.message }
      }

      if (!session?.user) {
        return { data: { session: null, user: null }, error: null }
      }

      // Obtener perfil del viajero si existe
      const { data: profile } = await supabase
        .from('viajeroz')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle()

      const authUser: AuthUser = Object.assign({}, session.user, {
        profile: profile || undefined,
      })

      return {
        data: { session, user: authUser },
        error: null,
      }
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: error instanceof Error ? error.message : 'Error obteniendo sesión',
      }
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return !!session?.user
    } catch {
      return false
    }
  }

  /**
   * Listener para cambios de autenticación
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Instancia global del servicio de autenticación
export const authService = new AuthService()
