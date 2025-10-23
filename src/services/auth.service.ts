import { supabase } from './supabase'
import { BaseService, type ServiceResponse } from './base.service'
import type { User, Session } from '@supabase/supabase-js'
import type { Viajeroz } from './supabase'

export interface AdminProfile {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  cargo?: string
  departamento?: string
  permisos_especiales?: string[]
  activo: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  profile?: Viajeroz
  adminProfile?: AdminProfile
  isAdmin?: boolean
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
   * Login con diferentes métodos según el rol
   * - Admin: email + password
   * - Viajero: identidad (DNI) + password
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

      // Determinar si es login de admin o viajero
      const isAdminLogin = !!credentials.email
      const isViajeroLogin = !!credentials.identidad

      if (!isAdminLogin && !isViajeroLogin) {
        return {
          data: null,
          error: 'Por favor proporcione email o DNI para iniciar sesión.',
        }
      }

      let authData
      let userId: string

      if (isViajeroLogin && credentials.identidad) {
        console.log('Intentando login de viajero con DNI:', credentials.identidad)

        // Buscar viajero por identidad
        const { data: viajero, error: viajeroError } = await supabase
          .from('viajeroz')
          .select('id, email')
          .eq('identidad', credentials.identidad)
          .maybeSingle()

        console.log('Resultado búsqueda viajero:', {
          viajero,
          viajeroError,
          identidadBuscada: credentials.identidad,
        })

        if (viajeroError || !viajero) {
          console.error('Error en búsqueda de viajero:', viajeroError)
          return {
            data: null,
            error: 'DNI no encontrado. Verifique sus credenciales.',
          }
        }

        console.log('Viajero encontrado:', viajero.email, 'con ID:', viajero.id)

        // Intentar login con el email asociado al viajero
        const { data, error } = await supabase.auth.signInWithPassword({
          email: viajero.email,
          password: credentials.password,
        })

        if (error) {
          console.error('Error en signInWithPassword (viajero):', error)
          return { data: null, error: 'Contraseña incorrecta.' }
        }

        authData = data
        userId = data.user.id
      } else if (isAdminLogin && credentials.email) {
        // Login de administrador con email/password
        console.log('Intentando login de administrador con email...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) {
          console.error('Error en signInWithPassword (admin):', error)
          return { data: null, error: 'Email o contraseña incorrectos.' }
        }

        authData = data
        userId = data.user.id
      } else {
        return {
          data: null,
          error: 'Credenciales inválidas.',
        }
      }

      console.log('Login exitoso en Supabase Auth, usuario:', authData.user.email)

      // Verificar el rol desde user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, viajero_id')
        .eq('user_id', userId)
        .maybeSingle()

      console.log('Role data:', roleData, 'Role error:', roleError)

      // 🔧 TEMPORAL: Si no hay rol asignado, verificar si es el primer usuario (admin)
      if (!roleData) {
        console.log('Usuario sin rol asignado, contactar administrador')
        await supabase.auth.signOut()
        return { data: null, error: 'Usuario sin rol asignado. Contacta al administrador.' }
      }

      let authUser: AuthUser

      if (roleData.role === 'admin') {
        // Es admin - obtener perfil de admins
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        console.log('Admin data:', adminData, 'Admin error:', adminError)

        authUser = Object.assign({}, authData.user, {
          adminProfile: adminData || undefined,
          isAdmin: true,
        })
      } else if (roleData.role === 'cliente') {
        // Es cliente - obtener perfil de viajeroz
        const { data: viajeroData, error: viajeroError } = await supabase
          .from('viajeroz')
          .select('*')
          .eq('id', roleData.viajero_id)
          .maybeSingle()

        console.log('Viajero data:', viajeroData, 'Viajero error:', viajeroError)

        authUser = Object.assign({}, authData.user, {
          profile: viajeroData || undefined,
          isAdmin: false,
        })
      } else {
        await supabase.auth.signOut()
        return { data: null, error: 'Rol de usuario no reconocido.' }
      }

      console.log('AuthUser creado:', authUser.email, 'isAdmin:', authUser.isAdmin)

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
   * Obtener sesión actual
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

      // Verificar si es admin o cliente
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, viajero_id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      let authUser: AuthUser = Object.assign({}, session.user)

      if (roleData?.role === 'admin') {
        // Es admin - obtener perfil de admins
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        authUser = Object.assign({}, session.user, {
          adminProfile: adminData || undefined,
          isAdmin: true,
        })
      } else if (roleData?.role === 'cliente' && roleData.viajero_id) {
        // Es cliente - obtener perfil de viajeroz usando viajero_id
        const { data: profile } = await supabase
          .from('viajeroz')
          .select('*')
          .eq('id', roleData.viajero_id)
          .maybeSingle()

        authUser = Object.assign({}, session.user, {
          profile: profile || undefined,
          isAdmin: false,
        })
      }

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
