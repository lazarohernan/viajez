<template>
  <div :class="wrapperClass">
    <div v-if="!hideHeader" class="mb-4">
      <h2 class="text-xl font-semibold text-gray-900">
        {{ isEditing ? 'Editar Viaje' : 'Nuevo Viaje' }}
      </h2>
      <p class="text-gray-600 text-sm">Completa los datos generales del viaje</p>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del viaje *</label>
          <input
            v-model="form.nombre"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ej. Bogotá Agosto"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            v-model="form.descripcion"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Opcional"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio *</label>
          <input
            v-model="form.fechaInicio"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de fin *</label>
          <input
            v-model="form.fechaFin"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div v-if="!hideActions" class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
        >
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const props = defineProps<{
  initialData?: Partial<{
    nombre: string
    fechaInicio: string
    fechaFin: string
    descripcion?: string
  }>
  isEditing?: boolean
  hideHeader?: boolean
  unstyled?: boolean
  hideActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, unknown>): void
  (e: 'cancel'): void
}>()

const form = reactive({
  nombre: props.initialData?.nombre || '',
  fechaInicio: props.initialData?.fechaInicio || '',
  fechaFin: props.initialData?.fechaFin || '',
  descripcion: props.initialData?.descripcion || '',
})

const wrapperClass = computed(() => (props.unstyled ? '' : 'bg-white rounded-2xl shadow-lg p-6'))

const onSubmit = () => {
  emit('submit', { ...form })
}

defineExpose({ submit: onSubmit })
</script>
