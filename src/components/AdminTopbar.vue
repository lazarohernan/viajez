<template>
  <header class="sticky top-4 z-30">
    <div
      class="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between"
    >
      <!-- Título / breadcrumb simple -->
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
        <h1 class="text-base md:text-lg font-semibold text-gray-900">{{ currentTitle }}</h1>
      </div>

      <!-- Acciones rápidas -->
      <div class="flex items-center space-x-2 md:space-x-3">
        <button
          type="button"
          class="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
          @click="notify('Perfil de usuario')"
        >
          <User class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, User } from 'lucide-vue-next'

const route = useRoute()
defineEmits<{ (e: 'toggle-sidebar'): void }>()

const currentTitle = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard')) return 'Dashboard'
  if (path.startsWith('/cliente')) return 'Clientes'
  if (path.startsWith('/viajes')) return 'Viajes'
  if (path.startsWith('/cotizaciones')) return 'Segmentos'
  return 'Administración'
})

const notify = (msg: string) => alert(msg)
</script>
