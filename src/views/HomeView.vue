<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/ui/Modal.vue'
import { useAuthStore } from '@/stores/auth'

// Asegurar que el fondo cubra toda la pantalla
onMounted(() => {
  // Forzar que el body y html tengan el ancho completo
  document.documentElement.style.width = '100%'
  document.documentElement.style.minHeight = '100vh'
  document.body.style.width = '100%'
  document.body.style.minHeight = '100vh'
})

const router = useRouter()
const authStore = useAuthStore()

// Estado del modal
const showLoginModal = ref(false)

// Form state para login
const loginForm = reactive({
  identidad: '',
  password: '',
})

const isLoading = ref(false)
const loginError = ref('')

// Abrir modal de login
const openLoginModal = () => {
  showLoginModal.value = true
  loginError.value = ''
}

// Cerrar modal de login
const closeLoginModal = () => {
  showLoginModal.value = false
  loginForm.identidad = ''
  loginForm.password = ''
  loginError.value = ''
}

// Login del viajero
const loginViajero = async () => {
  // Reset errors
  loginError.value = ''

  // Validate DNI
  if (!loginForm.identidad.trim()) {
    loginError.value = 'El DNI es obligatorio'
    return
  }

  if (!loginForm.password.trim()) {
    loginError.value = 'La contraseña es obligatoria'
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.login({
      identidad: loginForm.identidad,
      password: loginForm.password,
    })

    if (result.success) {
      // console.log('Login exitoso, verificando estado del usuario')

      // Verificar si el usuario está activo
      if (authStore.user?.profile && authStore.user.profile.activo === false) {
        // console.log('❌ Usuario desactivado, bloqueando acceso')
        loginError.value = 'Tu cuenta ha sido desactivada. Contacta al administrador.'
        await authStore.logout()
        return
      }

      // console.log('✅ Usuario activo, redirigiendo a viajes del cliente')
      closeLoginModal()
      router.push('/cliente/viajes')
    } else {
      loginError.value = result.error || 'Error al iniciar sesión'
    }
  } catch (error) {
    console.error('Error en login:', error)
    loginError.value = 'Error al iniciar sesión. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

// Go to admin
const goToAdmin = () => {
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-x-hidden"
  >
    <!-- Header -->
    <header
      class="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 w-full left-0 right-0"
    >
      <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 min-w-0">
          <!-- Logo -->
          <div class="flex items-center">
            <img src="/viajemoz.png" alt="ViajeMoz Logo" class="w-32 h-32 object-contain" />
          </div>

          <!-- Admin Access -->
          <button
            @click="goToAdmin"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Acceso Admin
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Consulta tu
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700"
          >
            itinerario de viaje
          </span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Accede de forma segura a toda la información de tu viaje con tu DNI y contraseña.
        </p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
        <div class="text-center">
          <button
            @click="openLoginModal"
            class="inline-flex items-center px-8 sm:px-10 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span class="whitespace-nowrap">Consultar Mi Viaje</span>
          </button>
          <p class="text-sm text-gray-600 mt-4 max-w-sm mx-auto">
            Ingresa tu número de identidad y contraseña para acceder a tu información de viaje
          </p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="text-center">
          <div
            class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Consulta Rápida</h3>
          <p class="text-gray-600">Accede a tu información de viaje en segundos con solo tu DNI</p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Información Completa</h3>
          <p class="text-gray-600">Todo lo que necesitas saber sobre tu viaje en un solo lugar</p>
        </div>

        <div class="text-center">
          <div
            class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Acceso Seguro</h3>
          <p class="text-gray-600">Tu información está protegida y solo tú puedes acceder</p>
        </div>
      </div>

      <!-- Modal de Login -->
      <Modal
        v-model="showLoginModal"
        :max-width="'md'"
        title="Acceder a mi itinerario"
        @close="closeLoginModal"
      >
        <form @submit.prevent="loginViajero" class="space-y-6">
          <div>
            <label for="login-dni" class="block text-sm font-medium text-gray-700 mb-2">
              Número de Identidad
            </label>
            <input
              id="login-dni"
              v-model="loginForm.identidad"
              type="text"
              required
              maxlength="13"
              class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Número de identidad"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              required
              class="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="Tu contraseña"
              :disabled="isLoading"
            />
          </div>

          <p v-if="loginError" class="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
            {{ loginError }}
          </p>

          <div class="flex gap-3">
            <button
              type="button"
              @click="closeLoginModal"
              :disabled="isLoading"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading" class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Acceder
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Accediendo...
              </span>
            </button>
          </div>
        </form>
      </Modal>
    </main>
  </div>
</template>

<style scoped>
/* Asegurar que el layout cubra completamente toda la pantalla */
.min-h-screen {
  min-height: 100vh !important;
  width: 100vw !important;
  max-width: 100vw !important;
}

/* Asegurar que el header cubra todo el ancho */
header {
  width: 100vw !important;
  max-width: 100vw !important;
  left: 0 !important;
  right: 0 !important;
}

/* Asegurar que el fondo cubra toda la pantalla */
.bg-gradient-to-br {
  background-size: cover !important;
  background-attachment: fixed !important;
}
</style>
