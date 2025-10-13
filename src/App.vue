<template>
  <div id="app" :class="appClasses">
    <!-- Layout para páginas administrativas -->
    <div v-if="showSidebar" class="relative">
      <!-- Sidebar flotante (peer) -->
      <AdminSidebar class="peer hidden md:block" />

      <!-- Contenido con margen dinámico respecto al sidebar -->
      <main
        class="min-h-screen transition-all duration-300 md:ml-24 peer-hover:md:ml-72 px-2 md:px-4 lg:px-6"
      >
        <AdminTopbar @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen" />
        <!-- Sidebar móvil overlay -->
        <transition name="fade">
          <div
            v-if="mobileSidebarOpen"
            class="fixed inset-0 z-50 bg-black/40 md:hidden"
            @click="mobileSidebarOpen = false"
          ></div>
        </transition>
        <transition name="slide">
          <aside
            v-if="mobileSidebarOpen"
            class="fixed inset-y-0 left-0 z-50 w-72 p-4 bg-white border-r border-gray-200 md:hidden"
          >
            <AdminSidebar />
          </aside>
        </transition>
        <div class="pt-4 md:pt-6 lg:pt-8">
          <RouterView />
        </div>
      </main>
    </div>

    <!-- Layout para páginas públicas (sin sidebar) -->
    <div v-else class="w-full public-layout">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminTopbar from './components/AdminTopbar.vue'

const route = useRoute()
const showSidebar = computed(
  () =>
    route.path.startsWith('/dashboard') ||
    (route.path.startsWith('/cliente') && !route.path.startsWith('/cliente/viajes')) ||
    route.path.startsWith('/viajes') ||
    route.path.startsWith('/cotizaciones'),
)
const mobileSidebarOpen = ref(false)

// Clases dinámicas para el app
const appClasses = computed(() => {
  if (showSidebar.value) {
    return 'min-h-screen bg-gray-50 admin-layout'
  }
  return 'min-h-screen w-full public-layout'
})
</script>

<style scoped>
/* Estilos para el layout público */
.public-layout {
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  overflow-x: hidden !important;
}

/* Asegurar que las páginas públicas no tengan espacios no deseados */
.public-layout :deep(*) {
  box-sizing: border-box;
}

.public-layout :deep(body) {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
}
</style>
