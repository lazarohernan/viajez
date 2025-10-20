<template>
  <div class="min-h-screen bg-slate-50 py-6">
    <div class="mx-auto w-full max-w-[1600px] space-y-8 px-6">
      <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Gestión de viajes</h1>
          <p class="text-sm text-gray-500">
            Administra itinerarios y asigna participantes fácilmente
          </p>
        </div>
        <button
          type="button"
          @click="openNew"
          class="inline-flex items-center gap-2 rounded-xl border border-transparent bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v12m6-6H6"
            />
          </svg>
          Nuevo viaje
        </button>
      </header>

      <section class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <article
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ stat.label }}</p>
          <div class="mt-2 flex items-end justify-between">
            <span class="text-2xl font-semibold text-gray-900">{{ stat.value }}</span>
            <span
              v-if="stat.badge"
              class="rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="stat.badgeClass"
            >
              {{ stat.badge }}
            </span>
          </div>
        </article>
      </section>

      <DataTable
        :columns="columns"
        :rows="displayRows"
        :loading="loading"
        empty-text="No hay viajes registrados"
        row-key-field="id"
      >
        <template #toolbar>
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <div class="relative w-full sm:w-72">
                <input
                  v-model="search"
                  type="text"
                  placeholder="Buscar por nombre o descripción"
                  class="w-full rounded-xl border border-gray-300 px-3 py-2 pl-10 text-sm text-gray-700 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <svg
                  class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                  />
                </svg>
              </div>
              <button
                type="button"
                class="self-start rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-100"
                @click="clearSearch"
              >
                Limpiar
              </button>
            </div>
            <p class="text-xs font-medium text-gray-500">{{ totalItems }} viajes en total</p>
          </div>
        </template>

        <template #cell:nombre="{ row }">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-900">{{ row.nombre }}</span>
              <span
                v-if="row.cotizacionLabel"
                class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {{ row.cotizacionLabel }}
              </span>
            </div>
            <p v-if="row.descripcion" class="text-xs text-gray-500">{{ row.descripcion }}</p>
          </div>
        </template>

        <template #cell:fechas="{ row }">
          <div class="text-sm font-medium text-gray-700">{{ row.fechasLabel }}</div>
          <div class="text-xs text-gray-400">{{ row.diasRestantesLabel }}</div>
        </template>

        <template #cell:estado="{ row }">
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="row.estadoClass"
          >
            {{ row.estadoLabel }}
          </span>
        </template>

        <template #cell:progreso="{ row }">
          <div class="flex items-center gap-3">
            <div class="h-2 flex-1 rounded-full bg-gray-200">
              <div
                class="h-2 rounded-full bg-orange-500 transition-all"
                :style="{ width: Math.min(row.progresoValue, 100) + '%' }"
              ></div>
            </div>
            <span class="text-xs font-semibold text-gray-600">{{ row.progresoValue }}%</span>
          </div>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <button
              class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
              @click="goDetail(row.raw)"
            >
              Ver
            </button>
            <button
              class="rounded-lg border border-orange-200 px-2.5 py-1 text-xs font-medium text-orange-700 transition hover:bg-orange-50"
              @click="edit(row.raw)"
            >
              Editar
            </button>
            <button
              class="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
              @click="deleteTrip(row.raw)"
            >
              Eliminar
            </button>
          </div>
        </template>

        <template #footer>
          <div
            class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-gray-600"
          >
            <div>
              <span v-if="totalRows">
                Mostrando {{ pageStart }}-{{ pageEnd }} de {{ totalRows }} viajes
              </span>
              <span v-else>No hay viajes para mostrar</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="currentPage === 1"
                @click="prevPage"
              >
                Anterior
              </button>
              <span class="px-2">Página {{ currentPage }} de {{ totalPages }}</span>
              <button
                type="button"
                class="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="currentPage === totalPages || totalRows === 0"
                @click="nextPage"
              >
                Siguiente
              </button>
            </div>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
import Modal from '@/components/ui/Modal.vue'
import ViajeForm from '@/components/ViajeForm.vue'
import ClientPickerModal from '@/components/ClientPickerModal.vue'
import { viajesService } from '@/services/viajes.service'
import { viajerozService, supabase, type Viaje, type Viajeroz } from '@/services/supabase'

// Variables reactivas
const router = useRouter()
const search = ref('')
const loading = ref(false)
const showForm = ref(false)
const isEditing = ref(false)
const editingData = ref<
  | {
      nombre: string
      fechaInicio: string
      fechaFin: string
      descripcion?: string
    }
  | undefined
>(undefined)
const showClientPicker = ref(false)
const selectedClients = ref<Viajeroz[]>([])
const allRows = ref<Viaje[]>([])
const editingDataRaw = ref<Viaje | undefined>(undefined)

// Paginación
const currentPage = ref(1)
const pageSizeOptions = [5, 10, 20, 50]
const pageSize = ref(pageSizeOptions[1])

// Cargar datos al montar el componente
onMounted(async () => {
  await loadViajes()
})

const columns: DataTableColumn[] = [
  { key: 'nombre', label: 'Viaje', width: '35%' },
  { key: 'fechas', label: 'Fechas', width: '18%' },
  { key: 'estado', label: 'Estado', width: '12%' },
  { key: 'progreso', label: 'Progreso', width: '20%' },
]

// Función para cargar viajes desde Supabase
const loadViajes = async () => {
  try {
    loading.value = true
    const result = await viajesService.list()
    allRows.value = result.data || []
  } catch (error) {
    console.error('Error al cargar viajes:', error)
    alert('Error al cargar los viajes')
  } finally {
    loading.value = false
  }
}

const filteredRows = computed(() => {
  if (!search.value) return allRows.value
  const term = search.value.toLowerCase().trim()
  return allRows.value.filter((row) =>
    [row.nombre, row.descripcion]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  )
})

const totalRows = computed(() => filteredRows.value.length)
const totalPages = computed(() =>
  totalRows.value ? Math.ceil(totalRows.value / pageSize.value) : 1,
)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// Estadísticas de viajes
const stats = computed(() => {
  const total = allRows.value.length
  const porIniciar = allRows.value.filter((v) => v.estado === 'por_iniciar').length
  const enCurso = allRows.value.filter((v) => v.estado === 'en_curso').length
  const finalizados = allRows.value.filter((v) => v.estado === 'finalizado').length

  return [
    {
      label: 'Total',
      value: total,
      badge: null,
      badgeClass: '',
    },
    {
      label: 'Por Iniciar',
      value: porIniciar,
      badge: porIniciar > 0 ? 'Pendientes' : null,
      badgeClass: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'En Curso',
      value: enCurso,
      badge: enCurso > 0 ? 'Activos' : null,
      badgeClass: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Finalizados',
      value: finalizados,
      badge: null,
      badgeClass: '',
    },
  ]
})

// Transformar filas para la tabla
const displayRows = computed(() => {
  return paginatedRows.value.map((viaje) => {
    // Calcular días restantes
    let diasRestantesLabel = ''
    if (viaje.fecha_inicio) {
      const hoy = new Date()
      const inicio = new Date(viaje.fecha_inicio)
      const diffTime = inicio.getTime() - hoy.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays > 0) {
        diasRestantesLabel = `Faltan ${diffDays} día${diffDays !== 1 ? 's' : ''}`
      } else if (diffDays === 0) {
        diasRestantesLabel = 'Hoy'
      } else {
        diasRestantesLabel = 'Ya comenzó'
      }
    }

    // Estado con estilos - Paleta cálida naranja
    const estadoMap = {
      por_iniciar: { label: 'Por Iniciar', class: 'bg-amber-100 text-amber-700' },
      en_curso: { label: 'En Curso', class: 'bg-orange-100 text-orange-700' },
      finalizado: { label: 'Finalizado', class: 'bg-emerald-100 text-emerald-700' },
    }
    const estadoInfo = estadoMap[viaje.estado] || {
      label: viaje.estado,
      class: 'bg-gray-100 text-gray-700',
    }

    return {
      id: viaje.id,
      nombre: viaje.nombre,
      descripcion: viaje.descripcion,
      cotizacionLabel: viaje.cotizacion_id ? 'Desde cotización' : null,
      fechasLabel: prettyRange(viaje.fecha_inicio, viaje.fecha_fin),
      diasRestantesLabel,
      estadoLabel: estadoInfo.label,
      estadoClass: estadoInfo.class,
      progresoValue: viaje.progreso_porcentaje || 0,
      raw: viaje,
    }
  })
})

const totalItems = computed(() => totalRows.value)

const clearSearch = () => {
  search.value = ''
}

const pageStart = computed(() => {
  if (!totalRows.value) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const pageEnd = computed(() => {
  if (!totalRows.value) return 0
  return Math.min(currentPage.value * pageSize.value, totalRows.value)
})

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

watch([search, pageSize], () => {
  currentPage.value = 1
})

watch(filteredRows, (rows) => {
  const maxPage = Math.max(1, Math.ceil(rows.length / pageSize.value))
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
})

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-HN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const prettyRange = (ini?: string, fin?: string) => {
  if (!ini && !fin) return 'Sin fechas'
  if (ini && !fin) return `Desde ${formatDate(ini)}`
  if (!ini && fin) return `Hasta ${formatDate(fin)}`
  return `${formatDate(ini)} → ${formatDate(fin)}`
}

const openNew = () => {
  isEditing.value = false
  editingData.value = undefined
  selectedClients.value = [] // Limpiar clientes seleccionados
  showForm.value = true
}

const edit = async (row: Viaje) => {
  isEditing.value = true
  editingDataRaw.value = row
  editingData.value = {
    nombre: row.nombre,
    fechaInicio: row.fecha_inicio ?? '',
    fechaFin: row.fecha_fin ?? '',
    descripcion: row.descripcion ?? '',
  }

  // Cargar los viajeros asociados al viaje
  try {
    const { data: viajeViajeroz, error } = await supabase
      .from('viaje_viajeroz')
      .select('viajero_id')
      .eq('viaje_id', row.id)

    if (error) throw error

    if (viajeViajeroz && viajeViajeroz.length > 0) {
      const viajeroIds = viajeViajeroz.map((vv) => vv.viajero_id)

      // Cargar datos completos de los viajeros
      const { data: viajerosData, error: viajerosError } = await supabase
        .from('viajeroz')
        .select('*')
        .in('id', viajeroIds)

      if (viajerosError) throw viajerosError

      selectedClients.value = viajerosData || []
      console.log('✅ Viajeros cargados:', selectedClients.value.length)
    } else {
      selectedClients.value = []
    }
  } catch (error) {
    console.error('Error al cargar viajeros del viaje:', error)
    selectedClients.value = []
  }

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
const submitViaje = async () => {
  try {
    console.log('🚀 Iniciando submitViaje...')

    // Invoca el submit del formulario interno
    const formData = viajeFormRef.value?.submit?.() as
      | {
          nombre: string
          fechaInicio: string
          fechaFin: string
          descripcion?: string
        }
      | undefined

    console.log('📝 Datos del formulario:', formData)

    if (!formData) {
      console.error('❌ No se pudo obtener datos del formulario')
      alert('Por favor completa todos los campos requeridos')
      return
    }

    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      fecha_inicio: formData.fechaInicio,
      fecha_fin: formData.fechaFin,
      estado: 'por_iniciar' as const,
      progreso_porcentaje: 0,
    }

    console.log('📦 Payload para Supabase:', payload)
    console.log('👥 Clientes seleccionados:', selectedClients.value.length)

    if (isEditing.value && editingDataRaw.value) {
      console.log('✏️ Actualizando viaje existente...')
      const result = await viajesService.update(editingDataRaw.value.id, payload)
      if (result.error) throw new Error(result.error)
      await syncSelectedClients(editingDataRaw.value.id)
      alert('Viaje actualizado correctamente')
    } else {
      console.log('➕ Creando nuevo viaje...')
      const result = await viajesService.create(payload)
      console.log('✅ Resultado de creación:', result)

      if (result.error || !result.data) {
        throw new Error(result.error || 'No se pudo crear el viaje')
      }

      console.log('🔗 Sincronizando clientes...')
      await syncSelectedClients(result.data.id)
      alert('Viaje creado correctamente')
    }

    console.log('🔄 Recargando lista de viajes...')
    await loadViajes()
    closeForm()
  } catch (error) {
    console.error('❌ Error al guardar viaje:', error)
    alert(
      `Error al guardar el viaje: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    )
  }
}

const closeForm = () => {
  showForm.value = false
  selectedClients.value = []
  editingDataRaw.value = undefined
}

const goDetail = (row: Viaje) => {
  // Navegar a la vista de detalle del viaje
  router.push(`/viajes/${row.id}`)
}

// Cargar viajeroz para el picker
const clientsMock = ref<Viajeroz[]>([])

const loadClients = async () => {
  try {
    clientsMock.value = await viajerozService.list()
  } catch (error) {
    console.error('Error al cargar viajeroz:', error)
    alert('Error al cargar la lista de viajeroz')
  }
}

const openClientPicker = async () => {
  if (clientsMock.value.length === 0) {
    await loadClients()
  }
  showClientPicker.value = true
}

const addClientToTrip = (c: Record<string, unknown>) => {
  const cliente = c as unknown as Viajeroz
  if (!selectedClients.value.find((x) => x.id === cliente.id)) {
    selectedClients.value.push(cliente)
  }
}

const removeClient = (id: string) => {
  selectedClients.value = selectedClients.value.filter((x) => x.id !== id)
}

// Eliminación con restricción: solo si no tiene personas añadidas (o confirmar doble)
const deleteTrip = async (row: Viaje) => {
  // Regla: no permitir eliminación si tiene participantes seleccionados en la sesión de edición
  const hasParticipants =
    selectedClients.value.length > 0 && isEditing.value && editingDataRaw.value?.id === row.id
  if (hasParticipants) {
    alert(
      'No puedes eliminar este viaje mientras tenga personas asignadas. Quita las personas primero.',
    )
    return
  }

  const confirmMsg = `¿Eliminar el viaje "${row.nombre}"? Esta acción no se puede deshacer.`
  if (confirm(confirmMsg)) {
    try {
      await viajesService.delete(row.id)
      await loadViajes()
      alert('Viaje eliminado correctamente')
    } catch (error) {
      console.error('Error al eliminar viaje:', error)
      alert('Error al eliminar el viaje')
    }
  }
}

const syncSelectedClients = async (viajeId: string) => {
  if (!selectedClients.value.length) {
    console.log('⚠️ No hay clientes seleccionados para sincronizar')
    return
  }

  console.log(`🔗 Sincronizando ${selectedClients.value.length} cliente(s) con viaje ${viajeId}`)

  // Eliminar relaciones existentes
  const { error: deleteError } = await supabase
    .from('viaje_viajeroz')
    .delete()
    .eq('viaje_id', viajeId)

  if (deleteError) {
    console.error('❌ Error al eliminar relaciones existentes:', deleteError)
    throw deleteError
  }

  // Insertar nuevas relaciones
  const inserts = selectedClients.value.map((viajero) => ({
    viaje_id: viajeId,
    viajero_id: viajero.id,
  }))

  console.log('📝 Insertando relaciones:', inserts)

  const { data, error: insertError } = await supabase
    .from('viaje_viajeroz')
    .insert(inserts)
    .select()

  if (insertError) {
    console.error('❌ Error al insertar relaciones:', insertError)
    throw insertError
  }

  console.log('✅ Relaciones sincronizadas correctamente:', data)
}
</script>
