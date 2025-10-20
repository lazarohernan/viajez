import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados del store
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isClient = computed(() => authStore.isClient)
  const user = computed(() => authStore.user)
  const userProfile = computed(() => authStore.userProfile)
  const session = computed(() => authStore.session)

  // Funciones de autenticación
  const login = async (credentials: {
    email?: string
    password?: string
    identidad?: string
    telefono?: string
  }) => {
    try {
      loading.value = true
      error.value = null

      const result = await authStore.login(credentials)

      if (!result.success) {
        error.value = result.error || 'Error en login'
        return false
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
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
      error.value = null

      const result = await authStore.signUp(userData)

      if (!result.success) {
        error.value = result.error || 'Error en registro'
        return { success: false, message: result.error }
      }

      return { success: true, message: result.message }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await authStore.logout()

      if (!result.success) {
        error.value = result.error || 'Error en logout'
        return false
      }

      // Redirigir al login
      router.push('/login')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      return false
    } finally {
      loading.value = false
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    try {
      return await authStore.checkAuth()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error verificando autenticación'
      return false
    }
  }

  const requireAuth = async () => {
    const authenticated = await checkAuth()
    if (!authenticated) {
      router.push('/login')
      return false
    }
    return true
  }

  const redirectIfAuthenticated = () => {
    if (isAuthenticated.value) {
      router.push('/dashboard')
      return true
    }
    return false
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    loading: computed(() => loading.value || authStore.loading),
    error,

    // Getters del store
    isAuthenticated,
    isClient,
    user,
    userProfile,
    session,

    // Acciones
    login,
    signUp,
    logout,
    checkAuth,
    requireAuth,
    redirectIfAuthenticated,
    clearError,
  }
}
