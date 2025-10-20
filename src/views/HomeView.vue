<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Asegurar que el fondo cubra toda la pantalla
onMounted(() => {
  // Forzar que el body y html tengan el ancho completo
  document.documentElement.style.width = '100%'
  document.documentElement.style.minHeight = '100vh'
  document.body.style.width = '100%'
  document.body.style.minHeight = '100vh'
})

const router = useRouter()

// Form state
const searchForm = reactive({
  dni: '',
})

const isLoading = ref(false)
const showResults = ref(false)
interface TripInfo {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  estado: string
  cliente: {
    nombre: string
    apellido: string
    email: string
  }
}

const tripInfo = ref<TripInfo | null>(null)
const dniError = ref('')

// Search trip by DNI
const searchTrip = async () => {
  // Reset errors
  dniError.value = ''

  // Validate DNI format
  if (!/^\d{8}$/.test(searchForm.dni)) {
    dniError.value = 'El DNI debe tener exactamente 8 dígitos numéricos'
    return
  }

  isLoading.value = true

  try {
    // Simulate API call - replace with real Supabase query
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock data - replace with real data from Supabase
    const mockTrip: TripInfo = {
      id: 1,
      nombre: 'Viaje a Bogotá - Agosto 2025',
      fechaInicio: '13/08/2025',
      fechaFin: '16/08/2025',
      estado: 'Confirmado',
      cliente: {
        nombre: 'Ana',
        apellido: 'López',
        email: 'ana@correo.com',
      },
    }

    tripInfo.value = mockTrip
    showResults.value = true
  } catch (error) {
    console.error('Error searching trip:', error)
    dniError.value = 'Error al consultar el viaje. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}

// Close results modal
const closeResults = () => {
  showResults.value = false
  tripInfo.value = null
}

// Go to admin
const goToAdmin = () => {
  router.push('/login')
}

// Get status class
const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmado':
      return 'bg-green-100 text-green-800'
    case 'borrador':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelado':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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
          Ingresa tu número de DNI para acceder a toda la información de tu viaje, incluyendo
          fechas, destinos, alojamiento y actividades.
        </p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
        <form @submit.prevent="searchTrip" class="max-w-md mx-auto">
          <div class="mb-6">
            <label for="dni" class="block text-sm font-medium text-gray-700 mb-2">
              Número de DNI
            </label>
            <input
              id="dni"
              v-model="searchForm.dni"
              type="text"
              required
              maxlength="8"
              pattern="[0-9]{8}"
              class="w-full px-4 py-3 text-lg text-center border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="12345678"
              :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': dniError }"
            />
            <p v-if="dniError" class="mt-2 text-sm text-red-600 text-center">
              {{ dniError }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-medium text-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <span v-if="!isLoading" class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Consultar Viaje
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
              Consultando...
            </span>
          </button>
        </form>
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

      <!-- Trip Results Modal -->
      <div v-if="showResults" class="fixed inset-0 z-50 overflow-y-auto">
        <div
          class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        >
          <div class="fixed inset-0 transition-opacity" @click="closeResults">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div
            class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          >
            <div class="bg-white px-6 py-4">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Información del Viaje</h3>
                <button
                  @click="closeResults"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Trip Info -->
              <div v-if="tripInfo" class="space-y-4">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">{{ tripInfo.nombre }}</h4>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600">Fecha de inicio:</span>
                      <p class="font-medium">{{ tripInfo.fechaInicio }}</p>
                    </div>
                    <div>
                      <span class="text-gray-600">Fecha de fin:</span>
                      <p class="font-medium">{{ tripInfo.fechaFin }}</p>
                    </div>
                  </div>
                  <div class="mt-3">
                    <span class="text-gray-600">Estado:</span>
                    <span
                      class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                      :class="getStatusClass(tripInfo.estado)"
                    >
                      {{ tripInfo.estado }}
                    </span>
                  </div>
                </div>

                <!-- Client Info -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600">Nombre:</span>
                      <p class="font-medium">
                        {{ tripInfo.cliente?.nombre }} {{ tripInfo.cliente?.apellido }}
                      </p>
                    </div>
                    <div>
                      <span class="text-gray-600">Email:</span>
                      <p class="font-medium">{{ tripInfo.cliente?.email }}</p>
                    </div>
                  </div>
                </div>

                <p class="text-sm text-gray-600 text-center">
                  Para más detalles sobre segmentos y anexos, contacta a tu agente de viajes.
                </p>
              </div>

              <!-- No Trip Found -->
              <div v-else class="text-center py-8">
                <div
                  class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg
                    class="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <h4 class="text-lg font-medium text-gray-900 mb-2">No se encontró el viaje</h4>
                <p class="text-gray-600 mb-4">
                  No se encontró ningún viaje asociado al DNI {{ searchForm.dni }}.
                </p>
                <p class="text-sm text-gray-500">
                  Verifica que el número sea correcto o contacta a tu agente de viajes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
