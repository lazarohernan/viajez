import { supabase } from './supabase'
import { BaseService, type ServiceResponse, fileService } from './base.service'
import type {
  Segmento,
  SegmentoTransporte,
  SegmentoHospedaje,
  SegmentoActividad,
  Documento,
} from './supabase'

export interface SegmentoWithDetails extends Segmento {
  segmento_transporte?: SegmentoTransporte
  segmento_hospedaje?: SegmentoHospedaje
  segmento_actividad?: SegmentoActividad
  documentos?: Documento[]
}

export interface CreateSegmentoData {
  tipo: 'transporte' | 'hospedaje' | 'actividad'
  nombre: string
  proveedor: string
  fecha_inicio: string
  fecha_fin?: string
  hora_inicio?: string
  hora_fin?: string
  duracion?: string
  observaciones?: string
  orden: number
  cotizacion_id?: string
  viaje_id?: string

  // Datos específicos por tipo
  transporte?: {
    tipo_transporte: 'aereo' | 'tren' | 'bus' | 'carro_privado' | 'uber' | 'otro'
    tiene_retorno?: boolean
    origen?: string
    destino?: string
  }

  hospedaje?: {
    tipo_hospedaje: 'hotel' | 'renta_privada' | 'airbnb' | 'otro'
    numero_habitaciones?: number
  }

  actividad?: {
    duracion_horas?: number
  }
}

/**
 * Servicio para gestión de segmentos de viaje/cotización
 */
export class SegmentosService extends BaseService {
  /**
   * Crear un nuevo segmento con sus datos específicos
   */
  async create(data: CreateSegmentoData): Promise<ServiceResponse<SegmentoWithDetails>> {
    try {
      // Crear segmento base
      const { data: segmento, error: segError } = await supabase
        .from('segmentos')
        .insert({
          tipo: data.tipo,
          nombre: data.nombre,
          proveedor: data.proveedor,
          fecha_inicio: this.formatDate(data.fecha_inicio),
          fecha_fin: data.fecha_fin ? this.formatDate(data.fecha_fin) : undefined,
          hora_inicio: data.hora_inicio,
          hora_fin: data.hora_fin,
          duracion: data.duracion,
          observaciones: data.observaciones,
          orden: data.orden,
          cotizacion_id: data.cotizacion_id,
          viaje_id: data.viaje_id,
        })
        .select()
        .single()

      if (segError) this.handleError(segError)

      let segmentoEspecifico = null

      // Crear datos específicos según el tipo
      switch (data.tipo) {
        case 'transporte':
          if (data.transporte) {
            const { data: transporte, error } = await supabase
              .from('segmento_transporte')
              .insert({
                segmento_id: segmento.id,
                ...data.transporte,
              })
              .select()
              .single()

            if (error) this.handleError(error)
            segmentoEspecifico = transporte
          }
          break

        case 'hospedaje':
          if (data.hospedaje) {
            const { data: hospedaje, error } = await supabase
              .from('segmento_hospedaje')
              .insert({
                segmento_id: segmento.id,
                ...data.hospedaje,
              })
              .select()
              .single()

            if (error) this.handleError(error)
            segmentoEspecifico = hospedaje
          }
          break

        case 'actividad':
          if (data.actividad) {
            const { data: actividad, error } = await supabase
              .from('segmento_actividad')
              .insert({
                segmento_id: segmento.id,
                ...data.actividad,
              })
              .select()
              .single()

            if (error) this.handleError(error)
            segmentoEspecifico = actividad
          }
          break
      }

      const segmentoWithDetails: SegmentoWithDetails = {
        ...segmento,
        [data.tipo === 'transporte'
          ? 'segmento_transporte'
          : data.tipo === 'hospedaje'
            ? 'segmento_hospedaje'
            : 'segmento_actividad']: segmentoEspecifico,
      }

      return { data: segmentoWithDetails, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error creando segmento',
      }
    }
  }

  /**
   * Obtener segmento por ID con todos los detalles
   */
  async getById(id: string): Promise<ServiceResponse<SegmentoWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('segmentos')
        .select(
          `
          *,
          segmento_transporte(*),
          segmento_hospedaje(*),
          segmento_actividad(*),
          documentos(*)
        `,
        )
        .eq('id', id)
        .single()

      if (error) this.handleError(error)

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error obteniendo segmento',
      }
    }
  }

  /**
   * Obtener segmentos por cotización
   */
  async getByCotizacion(cotizacionId: string): Promise<ServiceResponse<SegmentoWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('segmentos')
        .select(
          `
          *,
          segmento_transporte(*),
          segmento_hospedaje(*),
          segmento_actividad(*),
          documentos(*)
        `,
        )
        .eq('cotizacion_id', cotizacionId)
        .order('orden', { ascending: true })

      if (error) this.handleError(error)

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error obteniendo segmentos de cotización',
      }
    }
  }

  /**
   * Obtener segmentos por viaje
   */
  async getByViaje(viajeId: string): Promise<ServiceResponse<SegmentoWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('segmentos')
        .select(
          `
          *,
          segmento_transporte(*),
          segmento_hospedaje(*),
          segmento_actividad(*),
          documentos(*)
        `,
        )
        .eq('viaje_id', viajeId)
        .order('orden', { ascending: true })

      if (error) this.handleError(error)

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error obteniendo segmentos de viaje',
      }
    }
  }

  /**
   * Actualizar segmento
   */
  async update(
    id: string,
    data: Partial<CreateSegmentoData>,
  ): Promise<ServiceResponse<SegmentoWithDetails>> {
    try {
      const updateData: Record<string, unknown> = {}

      if (data.nombre) updateData.nombre = data.nombre
      if (data.proveedor) updateData.proveedor = data.proveedor
      if (data.fecha_inicio) updateData.fecha_inicio = this.formatDate(data.fecha_inicio)
      if (data.fecha_fin)
        updateData.fecha_fin = data.fecha_fin ? this.formatDate(data.fecha_fin) : null
      if (data.hora_inicio !== undefined) updateData.hora_inicio = data.hora_inicio
      if (data.hora_fin !== undefined) updateData.hora_fin = data.hora_fin
      if (data.duracion) updateData.duracion = data.duracion
      if (data.observaciones !== undefined) updateData.observaciones = data.observaciones
      if (data.orden) updateData.orden = data.orden

      updateData.updated_at = new Date().toISOString()

      const { data: segmento, error: segError } = await supabase
        .from('segmentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (segError) this.handleError(segError)

      // Actualizar datos específicos si se proporcionaron
      if (data.transporte && segmento.tipo === 'transporte') {
        const { error } = await supabase
          .from('segmento_transporte')
          .update(data.transporte)
          .eq('segmento_id', id)

        if (error) this.handleError(error)
      }

      if (data.hospedaje && segmento.tipo === 'hospedaje') {
        const { error } = await supabase
          .from('segmento_hospedaje')
          .update(data.hospedaje)
          .eq('segmento_id', id)

        if (error) this.handleError(error)
      }

      if (data.actividad && segmento.tipo === 'actividad') {
        const { error } = await supabase
          .from('segmento_actividad')
          .update(data.actividad)
          .eq('segmento_id', id)

        if (error) this.handleError(error)
      }

      // Obtener segmento actualizado con detalles
      return await this.getById(id)
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error actualizando segmento',
      }
    }
  }

  /**
   * Eliminar segmento
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from('segmentos').delete().eq('id', id)

      if (error) this.handleError(error)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error eliminando segmento',
      }
    }
  }

  /**
   * Reordenar segmentos
   */
  async reorder(segmentIds: string[]): Promise<ServiceResponse<boolean>> {
    try {
      // Actualizar el orden de cada segmento
      const updates = segmentIds.map((id, index) =>
        supabase
          .from('segmentos')
          .update({
            orden: index + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id),
      )

      const results = await Promise.all(updates)

      // Verificar si alguna actualización falló
      const hasError = results.some((result) => result.error)
      if (hasError) {
        throw new Error('Error reordenando segmentos')
      }

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error reordenando segmentos',
      }
    }
  }

  /**
   * Subir documento a un segmento
   */
  async uploadDocument(
    segmentoId: string,
    file: File,
    nombreArchivo?: string,
  ): Promise<ServiceResponse<Documento>> {
    try {
      // Subir archivo a Supabase Storage
      const fileName = nombreArchivo || file.name
      const uploadResult = await fileService.uploadFile(
        'documentos',
        `segmentos/${segmentoId}/${Date.now()}-${fileName}`,
        file,
      )

      if (uploadResult.error || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Error subiendo archivo')
      }

      // Guardar metadata en la base de datos
      const { data: documento, error } = await supabase
        .from('documentos')
        .insert({
          segmento_id: segmentoId,
          nombre_archivo: fileName,
          ruta_storage: uploadResult.data.path,
          tipo_archivo: file.type,
          tamano_bytes: file.size,
        })
        .select()
        .single()

      if (error) this.handleError(error)

      return { data: documento, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error subiendo documento',
      }
    }
  }

  /**
   * Eliminar documento
   */
  async deleteDocument(documentoId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Obtener documento para saber la ruta del archivo
      const { data: documento, error: getError } = await supabase
        .from('documentos')
        .select('ruta_storage')
        .eq('id', documentoId)
        .single()

      if (getError) this.handleError(getError)

      // Eliminar archivo de Storage
      if (documento?.ruta_storage) {
        const deleteResult = await fileService.deleteFile('documentos', documento.ruta_storage)
        if (deleteResult.error) {
          console.warn('Error eliminando archivo de storage:', deleteResult.error)
        }
      }

      // Eliminar registro de la base de datos
      const { error: deleteError } = await supabase
        .from('documentos')
        .delete()
        .eq('id', documentoId)

      if (deleteError) this.handleError(deleteError)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error eliminando documento',
      }
    }
  }

  /**
   * Obtener documentos de un segmento
   */
  async getDocuments(segmentoId: string): Promise<ServiceResponse<Documento[]>> {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('segmento_id', segmentoId)
        .order('created_at', { ascending: false })

      if (error) this.handleError(error)

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Error obteniendo documentos',
      }
    }
  }

  /**
   * Copiar segmento de cotización a viaje
   */
  async copyToViaje(
    segmentoId: string,
    viajeId: string,
  ): Promise<ServiceResponse<SegmentoWithDetails>> {
    try {
      // Obtener segmento original con detalles
      const { data: originalSegmento, error: getError } = await this.getById(segmentoId)
      if (getError || !originalSegmento) {
        throw new Error('Segmento original no encontrado')
      }

      // Crear nuevo segmento para el viaje
      const newSegmentoData: CreateSegmentoData = {
        tipo: originalSegmento.tipo,
        nombre: originalSegmento.nombre,
        proveedor: originalSegmento.proveedor,
        fecha_inicio: originalSegmento.fecha_inicio,
        fecha_fin: originalSegmento.fecha_fin,
        hora_inicio: originalSegmento.hora_inicio,
        hora_fin: originalSegmento.hora_fin,
        duracion: originalSegmento.duracion,
        observaciones: originalSegmento.observaciones,
        orden: originalSegmento.orden,
        viaje_id: viajeId,
      }

      // Copiar datos específicos según el tipo
      if (originalSegmento.tipo === 'transporte' && originalSegmento.segmento_transporte) {
        newSegmentoData.transporte = {
          tipo_transporte: originalSegmento.segmento_transporte.tipo_transporte,
          tiene_retorno: originalSegmento.segmento_transporte.tiene_retorno,
          origen: originalSegmento.segmento_transporte.origen,
          destino: originalSegmento.segmento_transporte.destino,
        }
      } else if (originalSegmento.tipo === 'hospedaje' && originalSegmento.segmento_hospedaje) {
        newSegmentoData.hospedaje = {
          tipo_hospedaje: originalSegmento.segmento_hospedaje.tipo_hospedaje,
          numero_habitaciones: originalSegmento.segmento_hospedaje.numero_habitaciones,
        }
      } else if (originalSegmento.tipo === 'actividad' && originalSegmento.segmento_actividad) {
        newSegmentoData.actividad = {
          duracion_horas: originalSegmento.segmento_actividad.duracion_horas,
        }
      }

      return await this.create(newSegmentoData)
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error copiando segmento',
      }
    }
  }
}

// Instancia global del servicio de segmentos
export const segmentosService = new SegmentosService()
