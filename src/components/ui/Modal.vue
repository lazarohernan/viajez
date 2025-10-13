<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-3 md:p-4"
        @click="onBackdrop"
      >
        <div :class="['w-full', maxWidthClass]" @click.stop>
          <transition name="scale">
            <div v-if="modelValue" class="bg-white rounded-2xl shadow-lg overflow-hidden">
              <header
                v-if="$slots.header || title"
                class="px-4 md:px-6 py-3 border-b border-gray-200 flex items-center justify-between"
              >
                <slot name="header">
                  <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                  <button
                    type="button"
                    class="ml-auto text-gray-500 hover:text-gray-700"
                    @click="close"
                  >
                    ✕
                  </button>
                </slot>
              </header>
              <section class="p-4 md:p-6 max-h-[80vh] overflow-y-auto">
                <slot />
              </section>
              <footer
                v-if="$slots.footer"
                class="px-4 md:px-6 py-3 border-t border-gray-100 bg-gray-50"
              >
                <slot name="footer" />
              </footer>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'

defineOptions({ name: 'UiModal' })

const props = defineProps<{
  modelValue: boolean
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

const maxWidthClass = computed(() => {
  const map = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
  } as const
  return `max-w-[95vw] ${map[props.maxWidth || 'xl']}`
})

const onKeyDown = (e: KeyboardEvent) => {
  if (!props.modelValue) return
  if (e.key === 'Escape' && (props.closeOnEsc ?? true)) {
    close()
  }
}

const onBackdrop = () => {
  if (props.closeOnBackdrop ?? true) close()
}

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.18s ease;
}
.scale-enter-from {
  transform: scale(0.98);
}
.scale-leave-to {
  transform: scale(0.98);
}
</style>
