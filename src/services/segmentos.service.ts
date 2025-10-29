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
  es_primero?: boolean
  es_ultimo?: boolean
  cotizacion_id?: string
  viaje_id?: string

  // Datos específicos por tipo
  transporte?: {
    tipo_transporte: 'aereo' | 'tren' | 'bus' | 'carro_privado' | 'auto_rentado' | 'uber' | 'otro'
    origen?: string
    destino?: string
    codigo_reserva?: string
    tiempo_escala_minutos?: number
    es_parte_escala?: boolean
  }

  hospedaje?: {
    tipo_hospedaje: 'hotel' | 'renta_privada' | 'airbnb' | 'otro'
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
      // Obtener segmentos existentes para detectar escalas
      const segmentosExistentes = await this.getSegmentosExistentes(
        data.cotizacion_id,
        data.viaje_id,
      )

      // Detectar si es parte de una escala
      const { tiempoEscala, esParteEscala } = await this.detectarYCalcularEscala(
        data,
        segmentosExistentes,
      )

      // Si es parte de escala, actualizar los datos
      if (esParteEscala && data.transporte) {
        data.transporte.tiempo_escala_minutos = tiempoEscala
        data.transporte.es_parte_escala = true

        // Actualizar el segmento anterior para marcar que tiene escala
        await this.marcarSegmentoAnteriorConEscala(segmentosExistentes, tiempoEscala || 0)
      }

      // Si se marca como último, validar que todos los segmentos estén en orden
      if (data.es_ultimo) {
        await this.validarOrdenSegmentos(data.cotizacion_id, data.viaje_id, data.orden)
      }

      // Si se marca como primero o último, desmarcar otros segmentos
      if (data.es_primero || data.es_ultimo) {
        await this.actualizarMarcadoresSegmentos(
          data.cotizacion_id,
          data.viaje_id,
          data.es_primero,
          data.es_ultimo,
        )
      }

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
          es_primero: data.es_primero || false,
          es_ultimo: data.es_ultimo || false,
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
          id,
          tipo,
          nombre,
          proveedor,
          fecha_inicio,
          fecha_fin,
          hora_inicio,
          hora_fin,
          duracion,
          observaciones,
          orden,
          es_primero,
          es_ultimo,
          cotizacion_id,
          viaje_id,
          created_at,
          updated_at,
          segmento_transporte (
            id,
            segmento_id,
            tipo_transporte,
            origen,
            destino,
            codigo_reserva,
            tiempo_escala_minutos,
            es_parte_escala,
            created_at,
            updated_at
          ),
          segmento_hospedaje (
            id,
            segmento_id,
            tipo_hospedaje,
            created_at,
            updated_at
          ),
          segmento_actividad (
            id,
            segmento_id,
            duracion_horas,
            created_at,
            updated_at
          ),
          documentos (
            id,
            segmento_id,
            nombre_archivo,
            ruta_storage,
            tipo_archivo,
            tamano_bytes,
            created_at,
            updated_at
          )
        `,
        )
        .eq('id', id)
        .single()

      if (error) {
        // Si es error de "no rows", devolver error específico
        if (error.code === 'PGRST116') {
          return {
            data: null,
            error: `Segmento con ID ${id} no encontrado`,
          }
        }
        this.handleError(error)
      }

      // Transformar la estructura para que coincida con SegmentoWithDetails
      const segmentoWithDetails: SegmentoWithDetails = {
        ...data,
        segmento_transporte: data.segmento_transporte?.[0] || null,
        segmento_hospedaje: data.segmento_hospedaje?.[0] || null,
        segmento_actividad: data.segmento_actividad?.[0] || null,
        documentos: data.documentos || [],
      }

      return { data: segmentoWithDetails, error: null }
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
          id,
          tipo,
          nombre,
          proveedor,
          fecha_inicio,
          fecha_fin,
          hora_inicio,
          hora_fin,
          duracion,
          observaciones,
          orden,
          es_primero,
          es_ultimo,
          cotizacion_id,
          viaje_id,
          created_at,
          updated_at,
          segmento_transporte (
            id,
            segmento_id,
            tipo_transporte,
            origen,
            destino,
            codigo_reserva,
            tiempo_escala_minutos,
            es_parte_escala,
            created_at,
            updated_at
          ),
          segmento_hospedaje (
            id,
            segmento_id,
            tipo_hospedaje,
            created_at,
            updated_at
          ),
          segmento_actividad (
            id,
            segmento_id,
            duracion_horas,
            created_at,
            updated_at
          ),
          documentos (
            id,
            segmento_id,
            nombre_archivo,
            ruta_storage,
            tipo_archivo,
            tamano_bytes,
            created_at,
            updated_at
          )
        `,
        )
        .eq('cotizacion_id', cotizacionId)
        .order('orden', { ascending: true })

      if (error) this.handleError(error)

      // Transformar cada segmento para que coincida con SegmentoWithDetails
      const segmentosWithDetails = (data || []).map((segmento) => {
        const segmentoCopia = JSON.parse(JSON.stringify(segmento))

        return {
          ...segmentoCopia,
          segmento_transporte:
            Array.isArray(segmentoCopia.segmento_transporte) &&
            segmentoCopia.segmento_transporte.length > 0
              ? segmentoCopia.segmento_transporte[0]
              : segmentoCopia.segmento_transporte || null,
          segmento_hospedaje:
            Array.isArray(segmentoCopia.segmento_hospedaje) &&
            segmentoCopia.segmento_hospedaje.length > 0
              ? segmentoCopia.segmento_hospedaje[0]
              : segmentoCopia.segmento_hospedaje || null,
          segmento_actividad:
            Array.isArray(segmentoCopia.segmento_actividad) &&
            segmentoCopia.segmento_actividad.length > 0
              ? segmentoCopia.segmento_actividad[0]
              : segmentoCopia.segmento_actividad || null,
          documentos: segmentoCopia.documentos || [],
        }
      })

      return { data: segmentosWithDetails, error: null }
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
          id,
          tipo,
          nombre,
          proveedor,
          fecha_inicio,
          fecha_fin,
          hora_inicio,
          hora_fin,
          duracion,
          observaciones,
          orden,
          es_primero,
          es_ultimo,
          cotizacion_id,
          viaje_id,
          created_at,
          updated_at,
          segmento_transporte (
            id,
            segmento_id,
            tipo_transporte,
            origen,
            destino,
            codigo_reserva,
            tiempo_escala_minutos,
            es_parte_escala,
            created_at,
            updated_at
          ),
          segmento_hospedaje (
            id,
            segmento_id,
            tipo_hospedaje,
            created_at,
            updated_at
          ),
          segmento_actividad (
            id,
            segmento_id,
            duracion_horas,
            created_at,
            updated_at
          ),
          documentos (
            id,
            segmento_id,
            nombre_archivo,
            ruta_storage,
            tipo_archivo,
            tamano_bytes,
            created_at,
            updated_at
          )
        `,
        )
        .eq('viaje_id', viajeId)
        .order('orden', { ascending: true })

      if (error) this.handleError(error)

      // Transformar cada segmento para que coincida con SegmentoWithDetails
      const segmentosWithDetails = (data || []).map((segmento) => ({
        ...segmento,
        segmento_transporte: segmento.segmento_transporte?.[0] || null,
        segmento_hospedaje: segmento.segmento_hospedaje?.[0] || null,
        segmento_actividad: segmento.segmento_actividad?.[0] || null,
        documentos: segmento.documentos || [],
      }))

      return { data: segmentosWithDetails, error: null }
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
      // Obtener el segmento actual para verificar si cambia el tipo
      const { data: segmentoActual, error: getError } = await supabase
        .from('segmentos')
        .select('tipo')
        .eq('id', id)
        .single()

      if (getError) this.handleError(getError)

      const updateData: Record<string, unknown> = {}

      if (data.tipo) updateData.tipo = data.tipo
      if (data.nombre) updateData.nombre = data.nombre
      if (data.proveedor) updateData.proveedor = data.proveedor
      if (data.fecha_inicio) updateData.fecha_inicio = this.formatDate(data.fecha_inicio)
      if (data.fecha_fin)
        updateData.fecha_fin = data.fecha_fin ? this.formatDate(data.fecha_fin) : null
      if (data.hora_inicio !== undefined) updateData.hora_inicio = data.hora_inicio
      if (data.hora_fin !== undefined) updateData.hora_fin = data.hora_fin
      if (data.duracion) updateData.duracion = data.duracion
      if (data.observaciones !== undefined) updateData.observaciones = data.observaciones
      if (data.orden !== undefined) updateData.orden = data.orden
      if (data.es_primero !== undefined) updateData.es_primero = data.es_primero
      if (data.es_ultimo !== undefined) updateData.es_ultimo = data.es_ultimo

      updateData.updated_at = new Date().toISOString()

      // Si el tipo cambió, eliminar datos del tipo anterior
      if (data.tipo && segmentoActual && data.tipo !== segmentoActual.tipo) {
        // Eliminar datos del tipo anterior
        if (segmentoActual.tipo === 'transporte') {
          await supabase.from('segmento_transporte').delete().eq('segmento_id', id)
        } else if (segmentoActual.tipo === 'hospedaje') {
          await supabase.from('segmento_hospedaje').delete().eq('segmento_id', id)
        } else if (segmentoActual.tipo === 'actividad') {
          await supabase.from('segmento_actividad').delete().eq('segmento_id', id)
        }
      }

      const { data: segmento, error: segError } = await supabase
        .from('segmentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (segError) this.handleError(segError)

      // Actualizar datos específicos si se proporcionaron
      // Usar el tipo actualizado (data.tipo si existe, sino el tipo actual del segmento)
      const tipoFinal = data.tipo || segmento.tipo

      if (data.transporte && tipoFinal === 'transporte') {
        // Verificar si existe registro en segmento_transporte
        const { data: existingTransporte, error: checkError } = await supabase
          .from('segmento_transporte')
          .select('id')
          .eq('segmento_id', id)
          .single()

        if (existingTransporte && !checkError) {
          // Actualizar registro existente
          const { error } = await supabase
            .from('segmento_transporte')
            .update(data.transporte)
            .eq('segmento_id', id)
          if (error) this.handleError(error)
        } else {
          // Crear nuevo registro
          const { error } = await supabase.from('segmento_transporte').insert({
            segmento_id: id,
            ...data.transporte,
          })
          if (error) this.handleError(error)
        }
      }

      if (data.hospedaje && tipoFinal === 'hospedaje') {
        // Verificar si existe registro en segmento_hospedaje
        const { data: existingHospedaje, error: checkError } = await supabase
          .from('segmento_hospedaje')
          .select('id')
          .eq('segmento_id', id)
          .single()

        if (existingHospedaje && !checkError) {
          // Actualizar registro existente
          const { error } = await supabase
            .from('segmento_hospedaje')
            .update(data.hospedaje)
            .eq('segmento_id', id)
          if (error) this.handleError(error)
        } else {
          // Crear nuevo registro
          const { error } = await supabase.from('segmento_hospedaje').insert({
            segmento_id: id,
            ...data.hospedaje,
          })
          if (error) this.handleError(error)
        }
      }

      if (data.actividad && tipoFinal === 'actividad') {
        // Verificar si existe registro en segmento_actividad
        const { data: existingActividad, error: checkError } = await supabase
          .from('segmento_actividad')
          .select('id')
          .eq('segmento_id', id)
          .single()

        if (existingActividad && !checkError) {
          // Actualizar registro existente
          const { error } = await supabase
            .from('segmento_actividad')
            .update(data.actividad)
            .eq('segmento_id', id)
          if (error) this.handleError(error)
        } else {
          // Crear nuevo registro
          const { error } = await supabase.from('segmento_actividad').insert({
            segmento_id: id,
            ...data.actividad,
          })
          if (error) this.handleError(error)
        }
      }

      // Obtener segmento actualizado con detalles
      const segmentoActualizado = await this.getById(id)
      if (segmentoActualizado.error) {
        // Si falla getById, devolver al menos el segmento básico
        console.warn(
          'Error obteniendo segmento actualizado con detalles:',
          segmentoActualizado.error,
        )
        return { data: segmento, error: null }
      }

      return segmentoActualizado
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
        es_primero: originalSegmento.es_primero,
        es_ultimo: originalSegmento.es_ultimo,
        viaje_id: viajeId,
      }

      // Copiar datos específicos según el tipo
      if (originalSegmento.tipo === 'transporte' && originalSegmento.segmento_transporte) {
        newSegmentoData.transporte = {
          tipo_transporte: originalSegmento.segmento_transporte.tipo_transporte,
          origen: originalSegmento.segmento_transporte.origen,
          destino: originalSegmento.segmento_transporte.destino,
        }
      } else if (originalSegmento.tipo === 'hospedaje' && originalSegmento.segmento_hospedaje) {
        newSegmentoData.hospedaje = {
          tipo_hospedaje: originalSegmento.segmento_hospedaje.tipo_hospedaje,
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

  /**
   * Actualizar marcadores de primero/último segmento
   * Desmarca otros segmentos cuando se marca uno nuevo
   */
  private async actualizarMarcadoresSegmentos(
    cotizacionId?: string,
    viajeId?: string,
    esPrimero?: boolean,
    esUltimo?: boolean,
  ): Promise<void> {
    try {
      // Desmarcar otros segmentos primeros
      if (esPrimero) {
        let query = supabase.from('segmentos').update({ es_primero: false }).eq('es_primero', true)

        if (cotizacionId) {
          query = query.eq('cotizacion_id', cotizacionId)
        } else {
          query = query.eq('viaje_id', viajeId!)
        }

        const { error } = await query
        if (error) {
          console.error('Error desmarcando segmentos primeros:', error)
        }
      }

      // Desmarcar otros segmentos últimos
      if (esUltimo) {
        let query = supabase.from('segmentos').update({ es_ultimo: false }).eq('es_ultimo', true)

        if (cotizacionId) {
          query = query.eq('cotizacion_id', cotizacionId)
        } else {
          query = query.eq('viaje_id', viajeId!)
        }

        const { error } = await query
        if (error) {
          console.error('Error desmarcando segmentos últimos:', error)
        }
      }
    } catch (error) {
      console.error('Error actualizando marcadores:', error)
    }
  }

  /**
   * Validar que todos los segmentos estén en orden cuando se marca el último
   * Verifica que no haya segmentos fuera del rango 1 a orden_ultimo
   */
  private async validarOrdenSegmentos(
    cotizacionId?: string,
    viajeId?: string,
    ordenUltimo?: number,
  ): Promise<void> {
    try {
      if (!ordenUltimo) return

      // Obtener todos los segmentos
      const { data: segmentos, error } = await supabase
        .from('segmentos')
        .select('id, orden, nombre')
        .eq(cotizacionId ? 'cotizacion_id' : 'viaje_id', cotizacionId || viajeId!)
        .order('orden', { ascending: true })

      if (error) throw error

      // Verificar que no haya segmentos fuera de rango
      const segmentosFueraDeRango = segmentos.filter((s) => s.orden < 1 || s.orden > ordenUltimo)

      if (segmentosFueraDeRango.length > 0) {
        const nombres = segmentosFueraDeRango
          .map((s) => `"${s.nombre}" (orden: ${s.orden})`)
          .join(', ')
        console.warn(
          `⚠️ AUDITORÍA: Se encontraron ${segmentosFueraDeRango.length} segmento(s) fuera de rango: ${nombres}`,
        )
      }
    } catch (error) {
      console.error('Error validando orden de segmentos:', error)
    }
  }

  /**
   * Detectar si un nuevo segmento forma parte de una escala y calcular el tiempo
   */
  async detectarYCalcularEscala(
    nuevoSegmento: CreateSegmentoData,
    segmentosExistentes: Segmento[],
  ): Promise<{ tiempoEscala?: number; esParteEscala: boolean }> {
    try {
      // Solo aplicar para vuelos aéreos
      if (
        nuevoSegmento.tipo !== 'transporte' ||
        nuevoSegmento.transporte?.tipo_transporte !== 'aereo'
      ) {
        return { esParteEscala: false }
      }

      // Buscar el último segmento de transporte aéreo
      const ultimoSegmentoAereo = segmentosExistentes
        .filter(
          (s) => s.tipo === 'transporte' && s.segmento_transporte?.tipo_transporte === 'aereo',
        )
        .sort((a, b) => b.orden - a.orden)[0]

      if (!ultimoSegmentoAereo?.segmento_transporte) {
        return { esParteEscala: false }
      }

      // Verificar si el origen del nuevo segmento coincide con el destino del anterior
      const origenNuevo = nuevoSegmento.transporte?.origen?.toLowerCase().trim()
      const destinoAnterior = ultimoSegmentoAereo.segmento_transporte.destino?.toLowerCase().trim()

      if (origenNuevo && destinoAnterior && origenNuevo === destinoAnterior) {
        // Calcular tiempo de escala
        const tiempoEscala = this.calcularTiempoEscala(ultimoSegmentoAereo, nuevoSegmento)

        return {
          tiempoEscala,
          esParteEscala: true,
        }
      }

      return { esParteEscala: false }
    } catch (error) {
      console.error('Error detectando escala:', error)
      return { esParteEscala: false }
    }
  }

  /**
   * Calcular el tiempo de escala entre dos segmentos
   */
  private calcularTiempoEscala(
    segmentoAnterior: Segmento,
    segmentoNuevo: CreateSegmentoData,
  ): number {
    try {
      const fechaHoraLlegadaAnterior = new Date(
        `${segmentoAnterior.fecha_fin}T${segmentoAnterior.hora_fin}`,
      )

      const fechaHoraSalidaNuevo = new Date(
        `${segmentoNuevo.fecha_inicio}T${segmentoNuevo.hora_inicio}`,
      )

      const diffMs = fechaHoraSalidaNuevo.getTime() - fechaHoraLlegadaAnterior.getTime()
      return Math.round(diffMs / (1000 * 60)) // Convertir a minutos
    } catch (error) {
      console.error('Error calculando tiempo de escala:', error)
      return 0
    }
  }

  /**
   * Obtener segmentos existentes para detectar escalas
   */
  private async getSegmentosExistentes(
    cotizacionId?: string,
    viajeId?: string,
  ): Promise<Segmento[]> {
    try {
      const { data, error } = await supabase
        .from('segmentos')
        .select(
          `
          *,
          segmento_transporte (*),
          segmento_hospedaje (*),
          segmento_actividad (*)
        `,
        )
        .eq(cotizacionId ? 'cotizacion_id' : 'viaje_id', cotizacionId || viajeId!)
        .order('orden', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error obteniendo segmentos existentes:', error)
      return []
    }
  }

  /**
   * Marcar el segmento anterior como que tiene escala
   */
  private async marcarSegmentoAnteriorConEscala(
    segmentosExistentes: Segmento[],
    tiempoEscala: number,
  ): Promise<void> {
    try {
      const ultimoSegmentoAereo = segmentosExistentes
        .filter(
          (s) => s.tipo === 'transporte' && s.segmento_transporte?.tipo_transporte === 'aereo',
        )
        .sort((a, b) => b.orden - a.orden)[0]

      if (ultimoSegmentoAereo?.segmento_transporte?.id) {
        await supabase
          .from('segmento_transporte')
          .update({
            tiempo_escala_minutos: tiempoEscala,
            es_parte_escala: true,
          })
          .eq('id', ultimoSegmentoAereo.segmento_transporte.id)
      }
    } catch (error) {
      console.error('Error marcando segmento anterior con escala:', error)
    }
  }

  /**
   * Recalcular marcadores de primero/último para todos los segmentos de un viaje
   * Útil después de importar segmentos desde una cotización
   */
  async recalcularMarcadoresViaje(viajeId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Obtener todos los segmentos del viaje ordenados
      const { data: segmentos, error } = await supabase
        .from('segmentos')
        .select('id, orden')
        .eq('viaje_id', viajeId)
        .order('orden', { ascending: true })

      if (error) throw error
      if (!segmentos || segmentos.length === 0) {
        return { data: true, error: null }
      }

      // Actualizar cada segmento según su posición
      for (let i = 0; i < segmentos.length; i++) {
        const segmento = segmentos[i]
        const esPrimero = i === 0
        const esUltimo = i === segmentos.length - 1

        await supabase
          .from('segmentos')
          .update({
            orden: i + 1, // Asegurar que el orden sea consecutivo
            es_primero: esPrimero,
            es_ultimo: esUltimo,
          })
          .eq('id', segmento.id)
      }

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error recalculando marcadores',
      }
    }
  }

  /**
   * Recalcular marcadores de primero/último para todos los segmentos de una cotización
   * Útil después de reordenar o eliminar segmentos
   */
  async recalcularMarcadoresCotizacion(cotizacionId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Obtener todos los segmentos de la cotización ordenados
      const { data: segmentos, error } = await supabase
        .from('segmentos')
        .select('id, orden')
        .eq('cotizacion_id', cotizacionId)
        .order('orden', { ascending: true })

      if (error) throw error
      if (!segmentos || segmentos.length === 0) {
        return { data: true, error: null }
      }

      // Actualizar cada segmento según su posición
      for (let i = 0; i < segmentos.length; i++) {
        const segmento = segmentos[i]
        const esPrimero = i === 0
        const esUltimo = i === segmentos.length - 1

        await supabase
          .from('segmentos')
          .update({
            orden: i + 1, // Asegurar que el orden sea consecutivo
            es_primero: esPrimero,
            es_ultimo: esUltimo,
          })
          .eq('id', segmento.id)
      }

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Error recalculando marcadores',
      }
    }
  }

  /**
   * Formatear tiempo de escala para mostrar en la UI
   */
  formatearTiempoEscala(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} min`
    }

    const horas = Math.floor(minutos / 60)
    const minsRestantes = minutos % 60

    if (minsRestantes === 0) {
      return `${horas}h`
    }

    return `${horas}h ${minsRestantes}min`
  }

  /**
   * Validar tiempo de escala mínimo
   */
  validarTiempoEscala(minutos: number): boolean {
    return minutos >= 30 // Mínimo 30 minutos entre vuelos
  }
}

// Instancia global del servicio de segmentos
export const segmentosService = new SegmentosService()
