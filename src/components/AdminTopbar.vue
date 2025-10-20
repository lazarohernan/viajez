<template>
  <header class="sticky top-4 z-30">
    <div
      class="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between"
    >
      <!-- Logo y navegación móvil -->
      <div class="flex items-center space-x-3">
        <!-- Botón hamburguesa para mobile -->
        <button
          type="button"
          class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
          @click="$emit('toggle-sidebar')"
        >
          <Menu class="w-5 h-5" />
        </button>
        <img src="/viajemoz.png" alt="ViajeMoz" class="h-8 w-auto rounded-sm" />
      </div>

      <!-- Acciones rápidas -->
      <div class="flex items-center space-x-2 md:space-x-3">
        <button
          type="button"
          class="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
          @click="goToProfile"
        >
          <User class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Menu, User } from 'lucide-vue-next'

const router = useRouter()
defineEmits<{ (e: 'toggle-sidebar'): void }>()

const goToProfile = () => {
  router.push('/perfil')
}
</script>
