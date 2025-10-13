<template>
  <Modal v-model="open" :max-width="'xl'" title="Agregar personas" @close="$emit('close')">
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-2">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar cliente por nombre o email"
          class="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          class="px-3 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
          @click="search = ''"
        >
          Limpiar
        </button>
      </div>

      <DataTable :columns="columns" :rows="filtered" :loading="false" empty-text="No hay clientes">
        <template #cell:nombre="{ row }">
          <div class="font-medium text-gray-900">{{ row.nombre }} {{ row.apellido }}</div>
          <div class="text-xs text-gray-500">{{ row.email }}</div>
        </template>
        <template #actions="{ row }">
          <button
            class="text-emerald-700 hover:text-emerald-900 text-sm font-medium"
            @click="add(row)"
          >
            Agregar
          </button>
        </template>
      </DataTable>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
          @click="open = false"
        >
          Cerrar
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'

const props = defineProps<{
  modelValue: boolean
  clients: Array<{ id: number | string; nombre: string; apellido: string; email?: string }>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'add', client: Record<string, unknown>): void
  (e: 'close'): void
}>()

const open = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (open.value = v),
)
watch(open, (v) => emit('update:modelValue', v))

const columns: DataTableColumn[] = [{ key: 'nombre', label: 'Cliente', width: '60%' }]

const search = ref('')
const filtered = computed(() => {
  if (!search.value) return props.clients
  const t = search.value.toLowerCase()
  return props.clients.filter(
    (c) =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(t) ||
      String(c.email || '')
        .toLowerCase()
        .includes(t),
  )
})

const add = (row: Record<string, unknown>) => emit('add', row)
</script>
