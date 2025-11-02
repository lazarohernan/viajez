import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inicializar autenticación
const authStore = useAuthStore()
authStore.initializeAuth()

// Manejador global de errores para extensiones del navegador
window.addEventListener('error', (event) => {
  // Ignorar errores comunes de extensiones del navegador
  if (event.filename?.includes('content_script.js') ||
      event.filename?.includes('chrome-extension://') ||
      event.message?.includes('Cannot read properties of undefined (reading \'control\')') ||
      event.message?.includes('shouldOfferCompletionListForField') ||
      event.message?.includes('elementWasFocused')) {
    event.preventDefault()
    console.warn('⚠️ Error de extensión del navegador ignorado:', event.message)
    return false
  }
})

// Manejador de promesas rechazadas no manejadas
window.addEventListener('unhandledrejection', (event) => {
  // Ignorar rechazos comunes de extensiones del navegador
  if (event.reason?.message?.includes('content_script.js') ||
      event.reason?.stack?.includes('chrome-extension://') ||
      event.reason?.message?.includes('Cannot read properties of undefined (reading \'control\')')) {
    event.preventDefault()
    console.warn('⚠️ Promesa rechazada de extensión del navegador ignorada:', event.reason?.message)
  }
})

app.mount('#app')
