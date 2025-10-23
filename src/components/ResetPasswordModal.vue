<template>
  <Modal v-model="isOpen" :max-width="'md'" :title="title" @close="handleClose">
    <div class="space-y-4">
      <!-- Información del viajero -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-sm font-medium text-gray-900 mb-2">Viajero</h3>
        <p class="text-sm text-gray-700">
          <span class="font-medium">{{ viajero?.nombre }} {{ viajero?.apellido }}</span>
        </p>
        <p class="text-xs text-gray-500 mt-1">DNI: {{ viajero?.identidad }}</p>
        <p class="text-xs text-gray-500">Email: {{ viajero?.email }}</p>
      </div>

      <!-- Estado: Generando -->
      <div v-if="loading" class="text-center py-6">
        <div class="inline-flex items-center gap-3">
          <svg
            class="animate-spin h-8 w-8 text-orange-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
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
          <span class="text-gray-700">{{ loadingMessage }}</span>
        </div>
      </div>

      <!-- Estado: Éxito -->
      <div v-else-if="success && newPassword" class="space-y-4">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <svg
              class="w-5 h-5 text-green-600 mt-0.5"
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
            <div class="flex-1">
              <h4 class="text-sm font-medium text-green-900 mb-1">
                {{ hasCredentials ? 'Contraseña reseteada' : 'Credenciales creadas' }}
              </h4>
              <p class="text-sm text-green-700">
                {{ successMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Contraseña generada -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Nueva Contraseña </label>
          <div class="flex gap-2">
            <input
              :value="newPassword"
              type="text"
              readonly
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              @click="copyPassword"
              class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center gap-1"
              :title="copied ? 'Copiado!' : 'Copiar contraseña'"
            >
              <svg
                v-if="!copied"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            Comparte esta contraseña con el viajero de forma segura.
          </p>
        </div>
      </div>

      <!-- Estado: Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg
            class="w-5 h-5 text-red-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-red-900 mb-1">Error</h4>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Estado: Inicial -->
      <div v-else class="text-center py-4">
        <p class="text-sm text-gray-600 mb-4">
          {{
            hasCredentials
              ? '¿Deseas generar una nueva contraseña?'
              : '¿Deseas crear credenciales de acceso?'
          }}
        </p>
        <p class="text-xs text-gray-500">
          {{
            hasCredentials
              ? 'Se generará una contraseña aleatoria segura.'
              : 'El viajero podrá iniciar sesión con su DNI y la contraseña generada.'
          }}
        </p>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          @click="handleClose"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {{ success ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button
          v-if="!success"
          type="button"
          @click="handleGenerate"
          :disabled="loading"
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Generando...' : 'Generar Contraseña' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from './ui/Modal.vue'
import type { Viajeroz } from '@/services/supabase'

interface Props {
  modelValue: boolean
  viajero: Viajeroz | null
  hasCredentials?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const loading = ref(false)
const success = ref(false)
const error = ref('')
const newPassword = ref('')
const copied = ref(false)

const title = computed(() => {
  if (props.hasCredentials) {
    return 'Resetear Contraseña'
  }
  return 'Crear Credenciales de Acceso'
})

const loadingMessage = computed(() => {
  if (props.hasCredentials) {
    return 'Generando nueva contraseña...'
  }
  return 'Creando credenciales...'
})

const successMessage = computed(() => {
  if (props.hasCredentials) {
    return 'La contraseña ha sido actualizada exitosamente.'
  }
  return 'Las credenciales han sido creadas exitosamente.'
})

const handleGenerate = async () => {
  if (!props.viajero) return

  loading.value = true
  error.value = ''
  success.value = false
  newPassword.value = ''

  try {
    // Aquí llamarás a tu store o servicio
    emit('success')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al generar contraseña'
  } finally {
    loading.value = false
  }
}

const copyPassword = async () => {
  if (!newPassword.value) return

  try {
    await navigator.clipboard.writeText(newPassword.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}

const handleClose = () => {
  isOpen.value = false
  // Reset state after animation
  setTimeout(() => {
    loading.value = false
    success.value = false
    error.value = ''
    newPassword.value = ''
    copied.value = false
  }, 300)
}

// Exponer método para ser llamado desde el padre
defineExpose({
  setPassword: (password: string) => {
    newPassword.value = password
    success.value = true
  },
  setError: (errorMessage: string) => {
    error.value = errorMessage
    loading.value = false
  },
  setLoading: (isLoading: boolean) => {
    loading.value = isLoading
  },
})
</script>
