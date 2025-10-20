<template>
  <!-- Header Title -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Perfil</h1>
    <p class="text-sm text-gray-600">Información personal del administrador</p>
  </div>

  <!-- Profile Content -->
  <div class="max-w-2xl">
    <!-- Basic Information Card -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"
        >
          <User class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Información Personal</h2>
          <p class="text-sm text-gray-600">Datos básicos del perfil</p>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Nombre completo -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            id="nombre"
            v-model="profile.nombre"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="Ingresa tu nombre completo"
          />
        </div>

        <!-- Correo electrónico -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            id="email"
            v-model="profile.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="admin@viajemoz.com"
          />
        </div>

        <!-- Teléfono -->
        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            id="telefono"
            v-model="profile.telefono"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            placeholder="+504 9999-9999"
          />
        </div>
      </div>

      <!-- Save Button -->
      <div class="mt-6 flex justify-end">
        <button
          type="button"
          class="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 font-medium"
          @click="saveProfile"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User } from 'lucide-vue-next'

// Profile data
const profile = ref({
  nombre: '',
  email: '',
  telefono: '',
})

// Save profile function
const saveProfile = () => {
  // Aquí iría la lógica para guardar en Supabase
  console.log('Guardando perfil:', profile.value)
  alert('Perfil guardado exitosamente')
}
</script>
