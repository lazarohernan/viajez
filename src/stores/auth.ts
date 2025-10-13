import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  tipo: 'admin' | 'cliente'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.tipo === 'admin')
  const isClient = computed(() => user.value?.tipo === 'cliente')

  const login = (userData: User) => {
    user.value = userData
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('auth_user')
  }

  const initializeAuth = () => {
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error)
        localStorage.removeItem('auth_user')
      }
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isClient,
    login,
    logout,
    initializeAuth,
  }
})
