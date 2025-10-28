<template>
  <div :class="wrapperClass">
    <div v-if="!hideHeader" class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        {{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}
      </h2>
      <p class="text-gray-600">
        {{
          isEditing
            ? 'Modifica la información del cliente'
            : 'Completa la información del nuevo cliente'
        }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Información Personal -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Ingrese el nombre"
          />
        </div>

        <div>
          <label for="apellido" class="block text-sm font-medium text-gray-700 mb-2">
            Apellido *
          </label>
          <input
            id="apellido"
            v-model="form.apellido"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Ingrese el apellido"
          />
        </div>
      </div>

      <!-- Información de Contacto -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2"> Email * </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="ejemplo@email.com"
          />
        </div>

        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            id="telefono"
            v-model="form.telefono"
            type="tel"
            required
            @input="formatTelefono"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Teléfono"
          />
        </div>
      </div>

      <!-- Identidad -->
      <div>
        <label for="identidad" class="block text-sm font-medium text-gray-700 mb-2">
          Identidad (DNI/RTN) *
        </label>
        <input
          id="identidad"
          v-model="form.identidad"
          type="text"
          required
          @input="formatIdentidad"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="DNI/RTN"
          maxlength="17"
        />
      </div>

      <!-- Información de Pasaporte -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="numero_pasaporte" class="block text-sm font-medium text-gray-700 mb-2">
            Número de Pasaporte
          </label>
          <input
            id="numero_pasaporte"
            v-model="form.numero_pasaporte"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="A12345678"
          />
        </div>

        <div>
          <label
            for="fecha_vencimiento_pasaporte"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Fecha de Vencimiento del Pasaporte
          </label>
          <input
            id="fecha_vencimiento_pasaporte"
            v-model="form.fecha_vencimiento_pasaporte"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <!-- Información de Visa -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="numero_visa" class="block text-sm font-medium text-gray-700 mb-2">
            Número de Visa
          </label>
          <input
            id="numero_visa"
            v-model="form.numero_visa"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Número de visa"
          />
        </div>

        <div>
          <label for="tipo_visa" class="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Visa
          </label>
          <input
            id="tipo_visa"
            v-model="form.tipo_visa"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Turista, Trabajo, etc."
          />
        </div>

        <div>
          <label for="pais_visa" class="block text-sm font-medium text-gray-700 mb-2">
            País de Visa
          </label>
          <input
            id="pais_visa"
            v-model="form.pais_visa"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Estados Unidos, Canadá, etc."
          />
        </div>
      </div>

      <!-- Fecha de Vencimiento de Visa -->
      <div>
        <label for="fecha_vencimiento_visa" class="block text-sm font-medium text-gray-700 mb-2">
          Fecha de Vencimiento de la Visa
        </label>
        <input
          id="fecha_vencimiento_visa"
          v-model="form.fecha_vencimiento_visa"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <!-- Información Personal Adicional -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="fecha_nacimiento" class="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            id="fecha_nacimiento"
            v-model="form.fecha_nacimiento"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label for="pais_residencia" class="block text-sm font-medium text-gray-700 mb-2">
            País de Residencia
          </label>
          <input
            id="pais_residencia"
            v-model="form.pais_residencia"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Honduras"
          />
        </div>
      </div>

      <!-- Credenciales de Acceso (solo al crear) -->
      <div v-if="!isEditing" class="space-y-2">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div class="flex gap-2 max-w-sm">
            <input
              id="password"
              v-model="form.password"
              type="text"
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 font-mono shadow-sm"
              placeholder="Generar..."
            />
            <button
              v-if="form.password"
              type="button"
              @click="copyToClipboard"
              class="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-1 text-sm font-medium shadow-sm"
              title="Copiar contraseña"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              type="button"
              @click="generatePassword"
              class="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-1 text-sm font-medium shadow-sm"
              title="Generar contraseña segura"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Generar
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1 max-w-sm">
            Si defines una contraseña, el viajero podrá iniciar sesión con su email y contraseña.
          </p>
        </div>

        <div v-if="passwordError" class="bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
          <p class="text-sm text-red-600">{{ passwordError }}</p>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="!isLoading"> {{ isEditing ? 'Actualizar' : 'Crear' }} Cliente </span>
          <span v-else class="flex items-center">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            {{ isEditing ? 'Actualizando...' : 'Creando...' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface ClientForm {
  nombre: string
  apellido: string
  email?: string
  telefono: string
  identidad?: string
  fecha_nacimiento?: string
  numero_pasaporte?: string
  fecha_vencimiento_pasaporte?: string
  numero_visa?: string
  pais_visa?: string
  tipo_visa?: string
  fecha_vencimiento_visa?: string
  pais_residencia?: string
  password?: string
  crear_credenciales?: boolean
}

const props = defineProps<{
  isEditing?: boolean
  initialData?: Partial<ClientForm>
  hideHeader?: boolean
  unstyled?: boolean
}>()

const wrapperClass = computed(() => (props.unstyled ? '' : 'bg-white rounded-lg shadow-md p-6'))

const emit = defineEmits<{
  submit: [data: ClientForm]
  cancel: []
}>()

const isLoading = ref(false)
const passwordError = ref('')

const form = reactive<ClientForm>({
  nombre: props.initialData?.nombre || '',
  apellido: props.initialData?.apellido || '',
  email: props.initialData?.email || '',
  telefono: props.initialData?.telefono || '',
  identidad: props.initialData?.identidad || '',
  fecha_nacimiento: props.initialData?.fecha_nacimiento || '',
  numero_pasaporte: props.initialData?.numero_pasaporte || '',
  fecha_vencimiento_pasaporte: props.initialData?.fecha_vencimiento_pasaporte || '',
  numero_visa: props.initialData?.numero_visa || '',
  pais_visa: props.initialData?.pais_visa || '',
  tipo_visa: props.initialData?.tipo_visa || '',
  fecha_vencimiento_visa: props.initialData?.fecha_vencimiento_visa || '',
  pais_residencia: props.initialData?.pais_residencia || '',
  password: '',
})

// Generar contraseña aleatoria
const generatePassword = () => {
  const length = 12
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  form.password = password
}

// Copiar al portapapeles
const copyToClipboard = async () => {
  if (!form.password) return

  try {
    await navigator.clipboard.writeText(form.password)
    // Mostrar feedback temporal
    alert('✅ Contraseña copiada al portapapeles')
  } catch (error) {
    console.error('Error al copiar:', error)
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = form.password
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('✅ Contraseña copiada al portapapeles')
  }
}

// Formatear identidad hondureña (DNI: XXXX-XXXX-XXXXX o RTN: XXXX-XXXX-XXXXXX)
const formatIdentidad = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Remover todos los caracteres que no sean números
  value = value.replace(/\D/g, '')

  // Limitar a 14 dígitos máximo (RTN)
  if (value.length > 14) {
    value = value.substring(0, 14)
  }

  // Aplicar formato según la cantidad de dígitos
  if (value.length > 0) {
    if (value.length <= 13) {
      // Formato DNI: XXXX-XXXX-XXXXX
      if (value.length <= 4) {
        // Primer grupo: XXXX
        value = value
      } else if (value.length <= 8) {
        // Segundo grupo: XXXX-XXXX
        value = value.substring(0, 4) + '-' + value.substring(4)
      } else {
        // Tercer grupo: XXXX-XXXX-XXXXX
        value = value.substring(0, 4) + '-' + value.substring(4, 8) + '-' + value.substring(8)
      }
    } else {
      // Formato RTN: XXXX-XXXX-XXXXXX (14 dígitos con dos guiones)
      if (value.length <= 4) {
        // Primer grupo: XXXX
        value = value
      } else if (value.length <= 8) {
        // Segundo grupo: XXXX-XXXX
        value = value.substring(0, 4) + '-' + value.substring(4)
      } else {
        // Tercer grupo: XXXX-XXXX-XXXXXX
        value = value.substring(0, 4) + '-' + value.substring(4, 8) + '-' + value.substring(8)
      }
    }
  }

  // Actualizar el valor del formulario
  form.identidad = value

  // Ajustar la posición del cursor si es necesario
}

// Formatear teléfono hondureño (+504 XXXX-XXXX)
const formatTelefono = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Remover todos los caracteres que no sean números o +
  value = value.replace(/[^\d+]/g, '')

  // Si no empieza con +504, agregarlo automáticamente
  if (!value.startsWith('+504')) {
    // Si empieza con 504, agregar el +
    if (value.startsWith('504')) {
      value = '+' + value
    } else if (value.startsWith('+') && !value.startsWith('+504')) {
      // Si empieza con + pero no es +504, reemplazar
      value = '+504' + value.substring(1)
    } else if (!value.startsWith('+')) {
      // Si no empieza con +, agregar +504
      value = '+504' + value
    }
  }

  // Limitar a +504 + 8 dígitos máximo
  if (value.length > 12) {
    // +504 + 8 dígitos
    value = value.substring(0, 12)
  }

  // Aplicar formato +504 XXXX-XXXX
  if (value.length > 4) {
    // Después de +504
    const numero = value.substring(4) // Solo los dígitos después de +504

    if (numero.length > 0) {
      if (numero.length <= 4) {
        // Primer grupo: XXXX
        value = '+504 ' + numero
      } else {
        // Segundo grupo: XXXX-XXXX
        value = '+504 ' + numero.substring(0, 4) + '-' + numero.substring(4)
      }
    }
  }

  // Actualizar el valor del formulario
  form.telefono = value
  // Esto es opcional pero mejora la UX
  setTimeout(() => {
    target.value = value
  }, 0)
}

const handleSubmit = async () => {
  isLoading.value = true
  passwordError.value = ''

  try {
    // Validaciones básicas
    if (!form.nombre.trim()) {
      passwordError.value = 'El nombre es requerido'
      isLoading.value = false
      return
    }

    if (!form.apellido.trim()) {
      passwordError.value = 'El apellido es requerido'
      isLoading.value = false
      return
    }

    if (!form.email?.trim()) {
      passwordError.value = 'El email es requerido'
      isLoading.value = false
      return
    }

    if (!form.telefono.trim()) {
      passwordError.value = 'El teléfono es requerido'
      isLoading.value = false
      return
    }

    // Validar formato de teléfono hondureño (+504 XXXX-XXXX)
    const telefonoRegex = /^\+504 \d{4}-\d{4}$/
    if (!telefonoRegex.test(form.telefono)) {
      passwordError.value = 'El teléfono debe tener el formato +504 XXXX-XXXX (ej: +504 9992-2008)'
      isLoading.value = false
      return
    }

    if (!form.identidad?.trim()) {
      passwordError.value = 'La identidad es requerida'
      isLoading.value = false
      return
    }

    // Validar formato de identidad hondureña (DNI: XXXX-XXXX-XXXXX o RTN: XXXX-XXXX-XXXXXX)
    const identidadRegex = /^(\d{4}-\d{4}-\d{5}|\d{4}-\d{4}-\d{6})$/
    if (!identidadRegex.test(form.identidad)) {
      passwordError.value =
        'La identidad debe tener el formato DNI (XXXX-XXXX-XXXXX) o RTN (XXXX-XXXX-XXXXXX)'
      isLoading.value = false
      return
    }

    if (!form.fecha_nacimiento) {
      passwordError.value = 'La fecha de nacimiento es requerida'
      isLoading.value = false
      return
    }

    // Validar si se proporciona contraseña
    if (form.password) {
      if (form.password.length < 6) {
        passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
        isLoading.value = false
        return
      }
    }

    // Preparar datos para enviar
    const dataToSubmit: ClientForm = {
      ...form,
      crear_credenciales: !!form.password,
    }

    // Si no hay contraseña, eliminar campos relacionados
    if (!form.password) {
      delete dataToSubmit.password
      delete dataToSubmit.crear_credenciales
    }

    // console.log('📤 Enviando datos del formulario:', dataToSubmit)
    emit('submit', dataToSubmit)
  } catch (error) {
    console.error('Error al enviar formulario:', error)
    passwordError.value = 'Error al procesar el formulario'
  } finally {
    isLoading.value = false
  }
}
</script>
