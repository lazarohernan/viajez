import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService, type AuthUser } from '@/services/auth.service'
import type { Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // Estado simplificado
  const user = ref<AuthUser | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const initializing = ref(true)

  // Getters computados
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const isClient = computed(() => !!user.value?.profile) // Si tiene perfil de viajero, es cliente
  const isAdmin = computed(() => !!user.value && !user.value?.profile) // Si no tiene perfil, es admin
  const userProfile = computed(() => user.value?.profile || null)

  // Acciones simplificadas
  const login = async (credentials: { email?: string; password?: string; identidad?: string }) => {
    try {
      loading.value = true
      const result = await authService.login(credentials)

      if (result.error || !result.data) {
        throw new Error(result.error || 'Error en login')
      }

      user.value = result.data
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    } finally {
      loading.value = false
    }
  }

  const signUp = async (userData: {
    nombre: string
    apellido: string
    email: string
    telefono: string
    identidad: string
    fecha_nacimiento: string
  }) => {
    try {
      loading.value = true
      const result = await authService.signUp(userData)

      if (result.error || !result.data) {
        throw new Error(result.error || 'Error en registro')
      }

      user.value = result.data
      return { success: true, message: 'Usuario registrado exitosamente. Revisa tu email.' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      const result = await authService.logout()

      if (result.error) {
        console.error('Error en logout:', result.error)
      }

      // Limpiar estado local
      user.value = null
      session.value = null

      return { success: true }
    } catch (error) {
      console.error('Error en logout:', error)
      // Limpiar estado local de todas formas
      user.value = null
      session.value = null
      return { success: false, error: 'Error al cerrar sesión' }
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = async () => {
    try {
      initializing.value = true

      // Obtener sesión actual
      const result = await authService.getCurrentSession()

      if (result.data) {
        session.value = result.data.session
        user.value = result.data.user
      }

      // Configurar listener para cambios de autenticación
      const {
        data: { subscription },
      } = authService.onAuthStateChange(async (event, newSession) => {
        // console.log('Auth state changed:', event, newSession)

        session.value = newSession

        if (newSession?.user) {
          // Actualizar información del usuario
          const userResult = await authService.getCurrentSession()
          if (userResult.data?.user) {
            user.value = userResult.data.user
          }
        } else {
          user.value = null
        }
      })

      // Cleanup subscription on store destruction
      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      initializing.value = false
    }
  }

  const refreshSession = async () => {
    try {
      const result = await authService.getCurrentSession()

      if (result.data) {
        session.value = result.data.session
        user.value = result.data.user
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error refrescando sesión',
      }
    }
  }

  // Verificar si el usuario está autenticado
  const checkAuth = async (): Promise<boolean> => {
    if (initializing.value) {
      // Esperar a que se inicialice
      await new Promise((resolve) => {
        const unwatch = () => {
          if (!initializing.value) {
            resolve(void 0)
          } else {
            setTimeout(unwatch, 50)
          }
        }
        unwatch()
      })
    }

    return isAuthenticated.value
  }

  return {
    // Estado
    user,
    session,
    loading,
    initializing,

    // Getters
    isAuthenticated,
    isAdmin,
    isClient,
    userProfile,

    // Acciones
    login,
    signUp,
    logout,
    initializeAuth,
    refreshSession,
    checkAuth,
  }
})
