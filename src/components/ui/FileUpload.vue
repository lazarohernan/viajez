<template>
  <div class="space-y-4">
    <!-- Área de subida de archivos -->
    <div
      class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
      :class="
        isDragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
      "
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div class="space-y-4">
        <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <Upload class="w-6 h-6 text-gray-600" />
        </div>

        <div>
          <p class="text-sm text-gray-600">
            Arrastra archivos aquí o
            <button
              type="button"
              class="text-orange-600 hover:text-orange-700 font-medium"
              @click="triggerFileInput"
            >
              selecciona archivos
            </button>
          </p>
          <p class="text-xs text-gray-500 mt-1">PNG, JPG, PDF hasta {{ maxFileSize }}MB cada uno</p>
        </div>

        <input
          ref="fileInput"
          type="file"
          multiple
          :accept="acceptedTypes"
          class="hidden"
          @change="onFileSelect"
        />
      </div>
    </div>

    <!-- Lista de archivos subidos -->
    <div v-if="files.length > 0" class="space-y-2">
      <h4 class="text-sm font-medium text-gray-900">Archivos adjuntos</h4>

      <div class="space-y-2">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <!-- Icono según tipo de archivo -->
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <FileText v-if="file.type.includes('pdf')" class="w-4 h-4 text-red-600" />
              <Image v-else-if="file.type.includes('image')" class="w-4 h-4 text-green-600" />
              <File class="w-4 h-4 text-gray-600" />
            </div>

            <!-- Información del archivo -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(file.size) }}
                <span v-if="file.uploadProgress && file.uploadProgress < 100">
                  • {{ file.uploadProgress }}%
                </span>
              </p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center gap-2">
            <!-- Barra de progreso -->
            <div v-if="file.uploadProgress !== undefined && file.uploadProgress < 100" class="w-16">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${file.uploadProgress}%` }"
                ></div>
              </div>
            </div>

            <!-- Botones de acción -->
            <button
              v-if="file.uploaded"
              type="button"
              class="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Archivo subido correctamente"
            >
              <Check class="w-4 h-4" />
            </button>

            <button
              v-if="file.error"
              type="button"
              class="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Error al subir archivo"
            >
              <AlertCircle class="w-4 h-4" />
            </button>

            <button
              type="button"
              class="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Eliminar archivo"
              @click="removeFile(index)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensajes de error -->
    <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, FileText, Image, File, Check, AlertCircle, X } from 'lucide-vue-next'

interface UploadedFile {
  file: File
  name: string
  size: number
  type: string
  uploadProgress?: number
  uploaded?: boolean
  error?: boolean
  url?: string
}

const props = defineProps<{
  maxFileSize?: number // en MB
  acceptedTypes?: string
  maxFiles?: number
}>()

const emit = defineEmits<{
  filesUploaded: [files: UploadedFile[]]
  fileRemoved: [file: UploadedFile]
}>()

const fileInput = ref<HTMLInputElement>()
const files = ref<UploadedFile[]>([])
const isDragOver = ref(false)
const errorMessage = ref('')

// Valores por defecto
const maxFileSize = computed(() => props.maxFileSize || 10) // 10MB por defecto
const acceptedTypes = computed(() => props.acceptedTypes || 'image/*,.pdf')
const maxFiles = computed(() => props.maxFiles || 5)

// Funciones de manejo de archivos
const triggerFileInput = () => {
  fileInput.value?.click()
}

const onDragOver = () => {
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (event: DragEvent) => {
  isDragOver.value = false
  const droppedFiles = event.dataTransfer?.files
  if (droppedFiles) {
    processFiles(droppedFiles)
  }
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    processFiles(target.files)
  }
}

const processFiles = (fileList: FileList) => {
  errorMessage.value = ''

  const newFiles: File[] = Array.from(fileList)

  // Validar límite de archivos
  if (files.value.length + newFiles.length > maxFiles.value) {
    errorMessage.value = `Máximo ${maxFiles.value} archivos permitidos`
    return
  }

  for (const file of newFiles) {
    // Validar tamaño del archivo
    if (file.size > maxFileSize.value * 1024 * 1024) {
      errorMessage.value = `El archivo ${file.name} supera el límite de ${maxFileSize.value}MB`
      continue
    }

    // Validar tipo de archivo
    if (!isValidFileType(file)) {
      errorMessage.value = `Tipo de archivo no permitido: ${file.name}`
      continue
    }

    // Agregar archivo
    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
    }

    files.value.push(uploadedFile)

    // Simular subida (aquí iría la lógica real de subida a Supabase Storage)
    simulateUpload(uploadedFile)
  }
}

const isValidFileType = (file: File): boolean => {
  const allowedTypes = acceptedTypes.value.split(',')
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  return allowedTypes.some((type) => {
    const cleanType = type.trim().toLowerCase()
    if (cleanType.startsWith('.')) {
      return fileName.endsWith(cleanType)
    }
    return fileType.includes(cleanType.replace('*', ''))
  })
}

const simulateUpload = async (uploadedFile: UploadedFile) => {
  // Simulación de subida con progreso
  for (let progress = 0; progress <= 100; progress += 10) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    uploadedFile.uploadProgress = progress
  }

  // Simular éxito o error aleatoriamente (en producción esto vendría de Supabase)
  const success = Math.random() > 0.2 // 80% de éxito

  if (success) {
    uploadedFile.uploaded = true
    uploadedFile.url = `https://storage.supabase.co/files/${uploadedFile.name}`
  } else {
    uploadedFile.error = true
  }

  // Emitir evento cuando se complete la subida
  emit(
    'filesUploaded',
    files.value.filter((f) => f.uploaded),
  )
}

const removeFile = (index: number) => {
  const removedFile = files.value.splice(index, 1)[0]
  emit('fileRemoved', removedFile)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Exponer funciones para uso externo
defineExpose({
  files: computed(() => files.value),
  clearFiles: () => {
    files.value = []
  },
  hasUploadedFiles: computed(() => files.value.some((f) => f.uploaded)),
})
</script>
