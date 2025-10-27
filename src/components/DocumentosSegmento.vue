<template>
  <div class="space-y-4">
    <!-- Header con botón de subir archivos -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Documentos Adjuntos</h3>
        <p class="text-sm text-gray-600">
          Sube reservas, boletos, confirmaciones y otros documentos
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        @click="showUpload = !showUpload"
      >
        <Upload class="w-4 h-4 mr-2" />
        {{ showUpload ? 'Ocultar' : 'Subir Archivos' }}
      </button>
    </div>

    <!-- Componente de subida de archivos -->
    <div v-if="showUpload" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <FileUpload
        :max-file-size="10"
        :accepted-types="'image/*,.pdf,.doc,.docx'"
        :max-files="5"
        @files-uploaded="onFilesUploaded"
        @file-removed="onFileRemoved"
      />
    </div>

    <!-- Indicador de carga -->
    <div v-if="loading" class="text-center py-4">
      <div class="inline-flex items-center px-4 py-2 text-sm text-gray-600">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
        Cargando documentos...
      </div>
    </div>

    <!-- Lista de documentos existentes -->
    <div v-else-if="documentos.length > 0" class="space-y-3">
      <div class="grid gap-3">
        <div
          v-for="documento in documentos"
          :key="documento.id"
          class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <!-- Información del documento -->
          <div class="flex items-center gap-3 flex-1">
            <!-- Icono según tipo -->
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText
                v-if="documento.tipo_archivo.includes('pdf')"
                class="w-5 h-5 text-red-600"
              />
              <Image
                v-else-if="documento.tipo_archivo.includes('image')"
                class="w-5 h-5 text-green-600"
              />
              <File class="w-5 h-5 text-blue-600" />
            </div>

            <!-- Detalles -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ documento.nombre_archivo }}</p>
              <p class="text-sm text-gray-500">
                {{ formatFileSize(documento.tamano_bytes) }} • Subido
                {{ formatDate(documento.created_at) }}
              </p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Descargar archivo"
              @click="downloadFile(documento)"
            >
              <Download class="w-4 h-4" />
            </button>

            <button
              type="button"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar archivo"
              @click="deleteDocumento(documento.id)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-else-if="!showUpload && !loading"
      class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
    >
      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <FileText class="w-6 h-6 text-gray-400" />
      </div>
      <p class="text-gray-500">No hay documentos adjuntos</p>
      <p class="text-sm text-gray-400 mt-1">
        Sube archivos para organizar mejor la información del segmento
      </p>
    </div>

    <!-- Mensajes de error y éxito -->
    <div
      v-if="errorMessage"
      :class="[
        'text-sm p-3 rounded-lg transition-all duration-300',
        errorMessage.includes('✅') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
      ]"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, withDefaults } from 'vue'
import { Upload, FileText, Image, File, Download, Trash2 } from 'lucide-vue-next'
import FileUpload from '@/components/ui/FileUpload.vue'
import { documentosService, type Documento } from '@/services/supabase'

interface Props {
  segmentoId: string
}

const props = withDefaults(defineProps<Props>(), {
  segmentoId: '',
})

const showUpload = ref(false)
const documentos = ref<Documento[]>([])
const errorMessage = ref('')
const loading = ref(false)

// Cargar documentos al montar el componente
onMounted(() => {
  loadDocumentos()
})

// Recargar cuando cambie el segmentoId
watch(
  () => props.segmentoId,
  () => {
    if (props.segmentoId) {
      loadDocumentos()
    }
  },
)

const loadDocumentos = async () => {
  if (!props.segmentoId) {
    console.warn('segmentoId no disponible para cargar documentos')
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    documentos.value = await documentosService.getBySegmento(props.segmentoId)
  } catch (error) {
    console.error('Error al cargar documentos:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Error al cargar los documentos'

    // Solo mostrar error si realmente había documentos antes o si es un error crítico
    if (documentos.value.length > 0) {
      documentos.value = []
    }
  } finally {
    loading.value = false
  }
}

interface UploadedFile {
  file: File
  name?: string
}

const onFilesUploaded = async (uploadedFiles: UploadedFile[]) => {
  try {
    errorMessage.value = ''

    // Subir cada archivo a Supabase
    for (const uploadedFile of uploadedFiles) {
      // La interfaz UploadedFile ya garantiza que file existe y no es undefined
      await documentosService.uploadFile(uploadedFile.file, props.segmentoId)
    }

    // Recargar lista de documentos
    await loadDocumentos()

    // Mostrar mensaje de éxito temporalmente
    errorMessage.value = `✅ ${uploadedFiles.length} archivo(s) subido(s) exitosamente`
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)

    // Ocultar área de subida después de subir
    showUpload.value = false
  } catch (error) {
    console.error('Error al subir archivos:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Error al subir los archivos'
  }
}

const onFileRemoved = (file: { id: string; name: string } | UploadedFile) => {
  // Aquí se podría implementar lógica adicional cuando se remueve un archivo
  console.log('Archivo removido del componente de subida:', file)
}

const downloadFile = async (documento: Documento) => {
  try {
    if (!documento.ruta_storage) {
      errorMessage.value = 'La ruta del archivo no está disponible'
      return
    }

    // Usar getSignedUrl para buckets privados
    const url = await documentosService.getSignedUrl(documento.ruta_storage)
    if (!url) {
      errorMessage.value = 'No se pudo obtener la URL del archivo'
      return
    }

    window.open(url, '_blank')
  } catch (error) {
    console.error('Error al descargar archivo:', error)
    errorMessage.value = 'Error al descargar el archivo'
  }
}

const deleteDocumento = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer.')) {
    return
  }

  try {
    errorMessage.value = ''
    await documentosService.delete(id)
    await loadDocumentos()

    // Mostrar mensaje de éxito
    errorMessage.value = '✅ Documento eliminado exitosamente'
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error al eliminar documento:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Error al eliminar el documento'
  }
}

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes < 0 || !Number.isFinite(bytes)) return 'Tamaño desconocido'

  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Asegurar que el índice esté dentro del rango válido
  const validIndex = Math.min(Math.max(i, 0), sizes.length - 1)
  return parseFloat((bytes / Math.pow(k, validIndex)).toFixed(2)) + ' ' + sizes[validIndex]
}

const formatDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return 'Fecha no disponible'
  }

  try {
    const date = new Date(dateString)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch (error) {
    console.error('Error al formatear fecha:', error)
    return 'Fecha inválida'
  }
}
</script>
