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
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="+504 1234-5678"
          />
        </div>
      </div>

      <!-- Dirección -->
      <div>
        <label for="direccion" class="block text-sm font-medium text-gray-700 mb-2">
          Dirección *
        </label>
        <textarea
          id="direccion"
          v-model="form.direccion"
          rows="3"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Ingrese la dirección completa"
        ></textarea>
      </div>

      <!-- Información de Pasaporte -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="numeroPasaporte" class="block text-sm font-medium text-gray-700 mb-2">
            Número de Pasaporte *
          </label>
          <input
            id="numeroPasaporte"
            v-model="form.numeroPasaporte"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="A12345678"
          />
        </div>

        <div>
          <label for="fechaEmisionPasaporte" class="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Emisión del Pasaporte *
          </label>
          <input
            id="fechaEmisionPasaporte"
            v-model="form.fechaEmisionPasaporte"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            for="fechaVencimientoPasaporte"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Fecha de Vencimiento del Pasaporte *
          </label>
          <input
            id="fechaVencimientoPasaporte"
            v-model="form.fechaVencimientoPasaporte"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <!-- Información de Visa -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="fechaEmisionVisa" class="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Emisión de la Visa
          </label>
          <input
            id="fechaEmisionVisa"
            v-model="form.fechaEmisionVisa"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label for="fechaVencimientoVisa" class="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Vencimiento de la Visa
          </label>
          <input
            id="fechaVencimientoVisa"
            v-model="form.fechaVencimientoVisa"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label for="identidad" class="block text-sm font-medium text-gray-700 mb-2">
            Identidad
          </label>
          <input
            id="identidad"
            v-model="form.identidad"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Número de identidad"
          />
        </div>
      </div>

      <!-- Información Personal Adicional -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            id="fechaNacimiento"
            v-model="form.fechaNacimiento"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label for="sexo" class="block text-sm font-medium text-gray-700 mb-2"> Sexo * </label>
          <select
            id="sexo"
            v-model="form.sexo"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div>
          <label for="paisResidencia" class="block text-sm font-medium text-gray-700 mb-2">
            País de Residencia *
          </label>
          <input
            id="paisResidencia"
            v-model="form.paisResidencia"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Honduras"
          />
        </div>
      </div>

      <div>
        <label for="paisNacimiento" class="block text-sm font-medium text-gray-700 mb-2">
          País de Nacimiento *
        </label>
        <input
          id="paisNacimiento"
          v-model="form.paisNacimiento"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Honduras"
        />
      </div>

      <!-- Botones de Acción -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          class="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, reactive, defineProps, defineEmits } from 'vue'

interface ClientForm {
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  numeroPasaporte: string
  fechaEmisionPasaporte: string
  fechaVencimientoPasaporte: string
  fechaEmisionVisa: string
  fechaVencimientoVisa: string
  identidad: string
  fechaNacimiento: string
  sexo: string
  paisResidencia: string
  paisNacimiento: string
}

import { computed } from 'vue'

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

const form = reactive<ClientForm>({
  nombre: props.initialData?.nombre || '',
  apellido: props.initialData?.apellido || '',
  email: props.initialData?.email || '',
  telefono: props.initialData?.telefono || '',
  direccion: props.initialData?.direccion || '',
  numeroPasaporte: props.initialData?.numeroPasaporte || '',
  fechaEmisionPasaporte: props.initialData?.fechaEmisionPasaporte || '',
  fechaVencimientoPasaporte: props.initialData?.fechaVencimientoPasaporte || '',
  fechaEmisionVisa: props.initialData?.fechaEmisionVisa || '',
  fechaVencimientoVisa: props.initialData?.fechaVencimientoVisa || '',
  identidad: props.initialData?.identidad || '',
  fechaNacimiento: props.initialData?.fechaNacimiento || '',
  sexo: props.initialData?.sexo || '',
  paisResidencia: props.initialData?.paisResidencia || '',
  paisNacimiento: props.initialData?.paisNacimiento || '',
})

const handleSubmit = async () => {
  isLoading.value = true

  try {
    // Aquí iría la lógica para enviar los datos
    console.log('Datos del formulario:', form)

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('submit', { ...form })
  } catch (error) {
    console.error('Error al enviar formulario:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
