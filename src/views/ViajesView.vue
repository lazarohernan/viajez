<template>
  <div class="min-h-screen bg-gray-50 py-4">
    <div class="w-full mx-auto px-2 md:px-4 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Viajes</h1>
          <p class="text-gray-600 text-sm">Listado de viajes y creación de nuevos</p>
        </div>
        <button
          type="button"
          @click="openNew"
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
          Nuevo Viaje
        </button>
      </div>

      <DataTable :columns="columns" :rows="rows" :loading="loading" empty-text="No hay viajes">
        <template #toolbar>
          <div class="flex items-center justify-between gap-2">
            <input
              v-model="search"
              type="text"
              placeholder="Buscar por nombre"
              class="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </template>
        <template #cell:nombre="{ row }">
          <div class="font-medium text-gray-900">{{ row.nombre }}</div>
          <div class="text-xs text-gray-500">{{ prettyRange(row.fechaInicio, row.fechaFin) }}</div>
        </template>
        <template #actions="{ row }">
          <button
            class="text-orange-700 hover:text-orange-900 text-sm font-medium mr-3"
            @click="edit(row)"
          >
            Editar
          </button>
          <button class="text-gray-600 hover:text-gray-800 text-sm mr-3" @click="goDetail(row)">
            Abrir
          </button>
          <button class="text-red-600 hover:text-red-700 text-sm" @click="deleteTrip(row)">
            Eliminar
          </button>
        </template>
      </DataTable>

      <Modal
        v-model="showForm"
        :max-width="'xl'"
        :title="isEditing ? 'Editar Viaje' : 'Nuevo Viaje'"
        @close="closeForm"
      >
        <div class="space-y-6">
          <ViajeForm
            ref="viajeFormRef"
            :initial-data="editingData"
            :is-editing="isEditing"
            :hide-header="true"
            :hide-actions="true"
            :unstyled="true"
          />

          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-gray-900">Personas en el viaje</h3>
              <button
                type="button"
                class="text-orange-700 hover:text-orange-900 text-sm font-medium"
                @click="openClientPicker"
              >
                Agregar personas
              </button>
            </div>
            <div
              v-if="selectedClients.length"
              class="border border-gray-200 rounded-xl divide-y divide-gray-200"
            >
              <div
                v-for="p in selectedClients"
                :key="p.id.toString()"
                class="px-3 py-2 text-sm flex items-center justify-between"
              >
                <div>
                  <div class="font-medium text-gray-900">{{ p.nombre }} {{ p.apellido }}</div>
                  <div class="text-xs text-gray-500">{{ p.email }}</div>
                </div>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-700 text-xs font-medium"
                  @click="removeClient(p.id)"
                >
                  Quitar
                </button>
              </div>
            </div>
            <div
              v-else
              class="border border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/50"
            >
              <div
                class="mx-auto mb-2 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              </div>
              <p class="text-sm text-gray-700">Aún no has agregado personas a este viaje.</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              @click="closeForm"
            >
              Cerrar
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
              @click="submitViaje"
            >
              {{ isEditing ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </Modal>

      <ClientPickerModal v-model="showClientPicker" :clients="clientsMock" @add="addClientToTrip" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
import Modal from '@/components/ui/Modal.vue'
import ViajeForm from '@/components/ViajeForm.vue'
import ClientPickerModal from '@/components/ClientPickerModal.vue'

// Interfaces para tipos de datos
interface Viaje {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  descripcion: string
}

interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
}

const search = ref('')
const loading = ref(false)
const showForm = ref(false)
const isEditing = ref(false)
const editingData = ref<Viaje | undefined>(undefined)
const showClientPicker = ref(false)
const selectedClients = ref<Cliente[]>([])

const columns: DataTableColumn[] = [
  { key: 'nombre', label: 'Viaje', width: '40%' },
  { key: 'descripcion', label: 'Descripción', width: '35%' },
]

const allRows = ref<Viaje[]>([
  {
    id: 101,
    nombre: 'Bogotá Agosto',
    fechaInicio: '2025-08-13',
    fechaFin: '2025-08-16',
    descripcion: 'Hotel + vuelo',
  },
  {
    id: 102,
    nombre: 'Medellín Set',
    fechaInicio: '2025-09-02',
    fechaFin: '2025-09-07',
    descripcion: 'Solo vuelos',
  },
])

const rows = computed(() => {
  if (!search.value) return allRows.value
  const t = search.value.toLowerCase()
  return allRows.value.filter((r) => String(r.nombre).toLowerCase().includes(t))
})

const prettyRange = (ini?: string, fin?: string) => {
  if (!ini || !fin) return ''
  return `${ini} → ${fin}`
}

const openNew = () => {
  isEditing.value = false
  editingData.value = undefined
  showForm.value = true
}

const edit = (row: Viaje) => {
  isEditing.value = true
  editingData.value = row
  showForm.value = true
}

// Función de envío comentada por no usarse actualmente
// const handleSubmit = (data: Partial<Viaje>) => {
//   showForm.value = false
//   if (isEditing.value) {
//     allRows.value = allRows.value.map((r) =>
//       r.id === editingData.value?.id ? { ...r, ...data } : r,
//     )
//   } else {
//     allRows.value = [{ id: Date.now(), ...data } as Viaje, ...allRows.value]
//   }
// }

// Referencia para enviar desde la botonera del modal
const viajeFormRef = ref<InstanceType<typeof ViajeForm> | null>(null)
const submitViaje = () => {
  // Invoca el submit del formulario interno
  viajeFormRef.value?.submit?.()
}

const closeForm = () => {
  showForm.value = false
}

const goDetail = (row: Viaje) => {
  // Placeholder: aquí iría la navegación a detalle
  alert(`Abrir detalle de viaje: ${row.nombre}`)
}

// Mock de clientes para el picker (se integrará con Supabase)
const clientsMock = ref<Cliente[]>([
  { id: 1, nombre: 'Ana', apellido: 'López', email: 'ana@correo.com' },
  { id: 2, nombre: 'Carlos', apellido: 'Pérez', email: 'carlos@correo.com' },
  { id: 3, nombre: 'María', apellido: 'García', email: 'maria@correo.com' },
])

const openClientPicker = () => (showClientPicker.value = true)
const addClientToTrip = (c: Record<string, unknown>) => {
  const cliente = c as unknown as Cliente
  if (!selectedClients.value.find((x) => x.id === cliente.id)) selectedClients.value.push(cliente)
}

const removeClient = (id: number) => {
  selectedClients.value = selectedClients.value.filter((x) => x.id !== id)
}

// Eliminación con restricción: solo si no tiene personas añadidas (o confirmar doble)
const deleteTrip = (row: Viaje) => {
  // Regla: no permitir eliminación si tiene participantes seleccionados en la sesión de edición
  const hasParticipants =
    selectedClients.value.length > 0 && isEditing.value && editingData.value?.id === row.id
  if (hasParticipants) {
    alert(
      'No puedes eliminar este viaje mientras tenga personas asignadas. Quita las personas primero.',
    )
    return
  }

  const confirmMsg = `¿Eliminar el viaje "${row.nombre}"? Esta acción no se puede deshacer.`
  if (confirm(confirmMsg)) {
    allRows.value = allRows.value.filter((r) => r.id !== row.id)
  }
}
</script>
