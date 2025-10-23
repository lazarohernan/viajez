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
          <div class="flex items-center justify-center gap-2">
            <button
              @click="editRow(row)"
              class="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
              title="Editar viajero"
              type="button"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="handlePasswordAction(row)"
              class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              :title="hasCredentials(row) ? 'Resetear contraseña' : 'Crear credenciales'"
              type="button"
            >
              <Key class="w-4 h-4" />
            </button>
            <button
              @click="toggleUserStatus(row)"
              class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              :title="row.activo ? 'Desactivar usuario' : 'Activar usuario'"
              type="button"
            >
              <UserCheck v-if="row.activo" class="w-4 h-4" />
              <UserX v-else class="w-4 h-4" />
            </button>
            <button
              @click="confirmDelete(row)"
              class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Eliminar viajero"
              type="button"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </template>
        <template #cell:nombre="{ row }">
          <div class="font-medium" :class="row.activo !== false ? 'text-gray-900' : 'text-red-600'">
            {{ row.nombre }} {{ row.apellido }}
          </div>
          <div class="text-xs text-gray-500">{{ row.email }}</div>
        </template>
        <template #cell:estado="{ row }">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="[
              row.activo !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
            ]"
          >
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
                v-if="row.activo !== false"
              />
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
                v-else
              />
            </svg>
            {{ row.activo !== false ? 'Activo' : 'Inactivo' }}
          </span>
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
        :title="isEditing ? 'Editar Viajero' : 'Nuevo Viajero'"
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

      <!-- Modal de confirmación de eliminación -->
      <Modal
        v-model="showDeleteConfirm"
        :max-width="'md'"
        title="Confirmar Eliminación"
        @close="cancelDelete"
      >
        <div class="space-y-4">
          <!-- Icono de advertencia -->
          <div class="flex items-center justify-center">
            <div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <svg
                class="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">¿Eliminar viajero?</h3>
            <p class="text-gray-600">
              Esta acción no se puede deshacer. Se eliminará permanentemente al viajero y toda su
              información.
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="cancelDelete"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="handleDelete"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Eliminar Viajero
            </button>
          </div>
        </div>
      </Modal>

      <!-- Modal de resetear/crear contraseña -->
      <ResetPasswordModal
        v-model="showPasswordModal"
        :viajero="selectedViajero"
        :has-credentials="selectedViajeroHasCredentials"
        ref="passwordModalRef"
        @success="handlePasswordSuccess"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Pencil, Trash2, Key, UserCheck, UserX } from 'lucide-vue-next'
import { useViajerosStore } from '@/stores/viajeros.store'
import ClientForm from '@/components/ClientForm.vue'
import ResetPasswordModal from '@/components/ResetPasswordModal.vue'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
import Modal from '@/components/ui/Modal.vue'
import type { Viajeroz } from '@/services/supabase'
import type { CreateViajeroData, UpdateViajeroData } from '@/services/viajeros.service'

const viajerosStore = useViajerosStore()

const showForm = ref(false)
const isEditing = ref(false)
const editingData = ref<Viajeroz | undefined>(undefined)
const search = ref('')
const showDeleteConfirm = ref(false)
const deletingId = ref<string | null>(null)
const showPasswordModal = ref(false)
const selectedViajero = ref<Viajeroz | null>(null)
const selectedViajeroHasCredentials = ref(false)
const passwordModalRef = ref<InstanceType<typeof ResetPasswordModal> | null>(null)

const columns: DataTableColumn[] = [
  { key: 'nombre', label: 'Viajero', width: '25%' },
  { key: 'telefono', label: 'Teléfono', width: '15%' },
  { key: 'pais_residencia', label: 'País Residencia', width: '17%' },
  { key: 'estado', label: 'Estado', width: '15%' },
  { key: 'documentos', label: 'Documentos', width: '18%' },
]

// Computed para obtener datos del store
const loading = computed(() => viajerosStore.loading)
const allRows = computed(() => viajerosStore.viajeros)

// Filtrar usuarios por búsqueda
const rows = computed(() => {
  let filteredRows = allRows.value

  // Aplicar búsqueda si hay término
  if (search.value) {
    const term = search.value.toLowerCase()
    filteredRows = filteredRows.filter(
      (r) =>
        `${r.nombre} ${r.apellido}`.toLowerCase().includes(term) ||
        String(r.email).toLowerCase().includes(term),
    )
  }

  // Mostrar todos los usuarios (activos e inactivos)
  return filteredRows
})

// Cargar datos al montar el componente
onMounted(async () => {
  await viajerosStore.fetchViajeros()
})

const handleSubmit = async (data: CreateViajeroData | UpdateViajeroData) => {
  // console.log('🎯 handleSubmit called with data:', data)
  try {
    if (isEditing.value && editingData.value) {
      // Actualizar viajero existente
      // console.log('🔄 Actualizando viajero existente:', editingData.value.id)
      const result = await viajerosStore.updateViajero(
        editingData.value.id,
        data as UpdateViajeroData,
      )
      // console.log('📡 Resultado de actualización:', result)
      if (result) {
        alert('✅ Viajero actualizado correctamente')
        closeForm()
        // Refrescar la lista
        await viajerosStore.fetchViajeros()
      } else {
        console.error('❌ Error al actualizar:', viajerosStore.error)
        // Mostrar mensaje de error más visible
        const errorMessage = viajerosStore.error || 'Error desconocido'
        if (errorMessage.includes('Cliente ya ingresado en el sistema')) {
          alert(`🚫 ${errorMessage}\n\nPor favor, verifica los datos o edita el cliente existente.`)
        } else {
          alert(`❌ Error al actualizar: ${errorMessage}`)
        }
      }
    } else {
      // Crear nuevo viajero
      // console.log('➕ Creando nuevo viajero')
      const result = await viajerosStore.createViajero(data as CreateViajeroData)
      // console.log('📡 Resultado de creación:', result)
      if (result) {
        alert('✅ Viajero creado correctamente')
        closeForm()
        // Refrescar la lista
        await viajerosStore.fetchViajeros()
      } else {
        console.error('❌ Error al crear:', viajerosStore.error)
        // Mostrar mensaje de error más visible
        const errorMessage = viajerosStore.error || 'Error desconocido'
        if (errorMessage.includes('Cliente ya ingresado en el sistema')) {
          alert(`🚫 ${errorMessage}\n\nPor favor, verifica los datos o edita el cliente existente.`)
        } else {
          alert(`❌ Error al crear: ${errorMessage}`)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error en handleSubmit:', error)
    alert(`❌ Error al guardar el viajero: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

const closeForm = () => {
  showForm.value = false
  isEditing.value = false
  editingData.value = undefined
}

const editRow = (row: Viajeroz) => {
  isEditing.value = true
  editingData.value = row
  showForm.value = true
}

const confirmDelete = (row: Viajeroz) => {
  deletingId.value = row.id
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!deletingId.value) return

  try {
    const success = await viajerosStore.deleteViajero(deletingId.value)
    if (success) {
      alert('Viajero eliminado correctamente')
    } else {
      alert(`Error al eliminar: ${viajerosStore.error}`)
    }
  } catch (error) {
    console.error('Error al eliminar:', error)
    alert('Error al eliminar el viajero')
  } finally {
    showDeleteConfirm.value = false
    deletingId.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deletingId.value = null
}

// Verificar si un viajero tiene credenciales
const hasCredentials = (viajero: Viajeroz): boolean => {
  // Aquí deberías verificar si el viajero tiene un user_id en user_roles
  // Por ahora, asumimos que si tiene email e identidad, podría tener credenciales
  return !!(viajero.email && viajero.identidad)
}

// Manejar acción de contraseña (crear o resetear)
const handlePasswordAction = async (viajero: Viajeroz) => {
  selectedViajero.value = viajero
  selectedViajeroHasCredentials.value = hasCredentials(viajero)
  showPasswordModal.value = true
}

// Manejar éxito de generación de contraseña
const handlePasswordSuccess = async () => {
  if (!selectedViajero.value || !passwordModalRef.value) return

  passwordModalRef.value.setLoading(true)

  try {
    if (selectedViajeroHasCredentials.value) {
      // Resetear contraseña existente
      const result = await viajerosStore.resetPassword(selectedViajero.value.id)
      if (result.success && result.password) {
        passwordModalRef.value.setPassword(result.password)
      } else {
        passwordModalRef.value.setError(viajerosStore.error || 'Error al resetear contraseña')
      }
    } else {
      // Crear credenciales nuevas
      passwordModalRef.value.setError(
        'Para crear credenciales, edita el viajero y agrega una contraseña',
      )
    }
  } catch (error) {
    console.error('Error:', error)
    passwordModalRef.value.setError('Error al procesar la solicitud')
  }
}

// Cambiar estado del usuario (activar/desactivar)
const toggleUserStatus = async (viajero: Viajeroz) => {
  // console.log('🎯 toggleUserStatus called with viajero:', viajero)
  const action = viajero.activo ? 'desactivar' : 'activar'
  // console.log('🔄 Action:', action, 'Estado actual:', viajero.activo)

  if (
    !confirm(`¿Está seguro que desea ${action} al usuario ${viajero.nombre} ${viajero.apellido}?`)
  ) {
    // console.log('❌ Usuario canceló la acción')
    return
  }

  // console.log('✅ Usuario confirmó, llamando a store...')
  try {
    const success = await viajerosStore.toggleViajeroStatus(viajero.id)
    // console.log('📡 Resultado de toggleViajeroStatus:', success)
    if (success) {
      // Refrescar la lista para actualizar la UI
      await viajerosStore.fetchViajeros()
      alert(`Usuario ${action}do exitosamente`)
      // console.log('✅ Operación completada exitosamente')
    } else {
      alert(`Error al ${action} usuario: ${viajerosStore.error}`)
      // console.log('❌ Error en la operación:', viajerosStore.error)
    }
  } catch (error) {
    console.error('❌ Error al cambiar estado del usuario:', error)
    alert('Error al cambiar estado del usuario')
  }
}
</script>
