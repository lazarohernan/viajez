<template>
  <div class="min-h-screen bg-gray-50 py-4">
    <div class="w-full mx-auto px-2 md:px-4 space-y-6">
      <!-- Acciones -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Viajeroz</h1>
          <p class="text-gray-600 text-sm">Listado resumido y creación de nuevos viajeroz</p>
        </div>
        <button
          type="button"
          @click="showForm = true"
          class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v12m6-6H6"
            />
          </svg>
          Nuevo Viajeroz
        </button>
      </div>

      <!-- Tabla de clientes -->
      <DataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        empty-text="No hay viajeroz cargados"
      >
        <template #toolbar>
          <div class="flex items-center justify-between gap-2">
            <input
              v-model="search"
              type="text"
              placeholder="Buscar por nombre o email"
              class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </template>
        <template #actions="{ row }">
          <button
            class="text-orange-700 hover:text-orange-900 text-sm font-medium"
            @click="editRow(row)"
          >
            Editar
          </button>
        </template>
        <template #cell:nombre="{ row }">
          <div class="font-medium text-gray-900">{{ row.nombre }} {{ row.apellido }}</div>
          <div class="text-xs text-gray-500">{{ row.email }}</div>
        </template>
        <template #cell:documentos="{ row }">
          <div class="text-xs text-gray-700">
            Pasaporte: <span class="font-medium">{{ row.numero_pasaporte || '—' }}</span>
          </div>
          <div class="text-xs text-gray-700">
            Identidad: <span class="font-medium">{{ row.identidad || '—' }}</span>
          </div>
        </template>
      </DataTable>

      <!-- Modal/Formulario -->
      <Modal
        v-model="showForm"
        :max-width="'3xl'"
        :title="isEditing ? 'Editar Viajeroz' : 'Nuevo Viajeroz'"
        @close="closeForm"
      >
        <ClientForm
          :is-editing="isEditing"
          :initial-data="editingData"
          :hide-header="true"
          :unstyled="true"
          @submit="handleSubmit"
          @cancel="closeForm"
        />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ClientForm from '@/components/ClientForm.vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
import Modal from '@/components/ui/Modal.vue'

// Interfaz para tipo Cliente
interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  pais_residencia: string
  numero_pasaporte?: string
  identidad?: string
}

const showForm = ref(false)
const isEditing = ref(false)
const editingData = ref<Cliente | undefined>(undefined)
const search = ref('')
const loading = ref(false)

const columns: DataTableColumn[] = [
  { key: 'nombre', label: 'Viajeroz', width: '28%' },
  { key: 'telefono', label: 'Teléfono', width: '16%' },
  { key: 'pais_residencia', label: 'País Residencia', width: '18%' },
  { key: 'documentos', label: 'Documentos', width: '22%' },
]

// Datos mock por ahora (luego se integrará Supabase)
const allRows = ref<Cliente[]>([
  {
    id: 1,
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana@correo.com',
    telefono: '+504 1111-2222',
    pais_residencia: 'Honduras',
    numero_pasaporte: 'A123456',
    identidad: '0801-1990-00001',
  },
  {
    id: 2,
    nombre: 'Carlos',
    apellido: 'Pérez',
    email: 'carlos@correo.com',
    telefono: '+504 2222-3333',
    pais_residencia: 'Colombia',
    numero_pasaporte: 'B987654',
    identidad: '0801-1988-00002',
  },
])

const rows = computed(() => {
  if (!search.value) return allRows.value
  const term = search.value.toLowerCase()
  return allRows.value.filter(
    (r) =>
      `${r.nombre} ${r.apellido}`.toLowerCase().includes(term) ||
      String(r.email).toLowerCase().includes(term),
  )
})

const handleSubmit = (data: Partial<Cliente>) => {
  console.log('Viajeroz guardado:', data)
  showForm.value = false
  isEditing.value = false
  // TODO: Integrar con Supabase; por ahora agregar al mock
  allRows.value = [{ id: Date.now(), ...data } as Cliente, ...allRows.value]
  alert('Viajeroz guardado correctamente')
}

const closeForm = () => {
  showForm.value = false
  isEditing.value = false
  editingData.value = undefined
}

const editRow = (row: Cliente) => {
  isEditing.value = true
  editingData.value = row
  showForm.value = true
}
</script>
