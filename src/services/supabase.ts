import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cliente principal de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Tipos de datos basados en el esquema de la base de datos
// Interfaz para administradores (tabla separada)
export interface Admin {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  activo: boolean
  created_at: string
  updated_at: string
}

// Interfaz para clientes/viajeros
export interface Viajeroz {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  identidad: string
  fecha_nacimiento: string
  numero_pasaporte?: string
  fecha_vencimiento_pasaporte?: string
  numero_visa?: string
  pais_visa?: string
  tipo_visa?: string
  fecha_vencimiento_visa?: string
  pais_residencia?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Viaje {
  id: string
  nombre: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin?: string
  estado: 'por_iniciar' | 'en_curso' | 'finalizado'
  progreso_porcentaje: number
  cotizacion_id?: string
  created_at: string
  updated_at: string
}

export interface Cotizacion {
  id: string
  nombre: string
  viajero_id?: string
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada'
  created_at: string
  updated_at: string
}

export interface Segmento {
  id: string
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
  es_primero: boolean
  es_ultimo: boolean
  cotizacion_id?: string
  viaje_id?: string
  created_at: string
  updated_at: string
  // Joins opcionales
  segmento_transporte?: SegmentoTransporte
  segmento_hospedaje?: SegmentoHospedaje
  segmento_actividad?: SegmentoActividad
}

export interface SegmentoTransporte {
  id: string
  segmento_id: string
  tipo_transporte: 'aereo' | 'tren' | 'bus' | 'carro_privado' | 'auto_rentado' | 'uber' | 'otro'
  tiene_retorno: boolean
  origen?: string
  destino?: string
  created_at: string
  updated_at: string
}

export interface SegmentoHospedaje {
  id: string
  segmento_id: string
  tipo_hospedaje: 'hotel' | 'renta_privada' | 'airbnb' | 'otro'
  created_at: string
  updated_at: string
}

export interface SegmentoActividad {
  id: string
  segmento_id: string
  duracion_horas?: number
  created_at: string
  updated_at: string
}

export interface Documento {
  id: string
  segmento_id: string
  nombre_archivo: string
  ruta_storage: string
  tipo_archivo: string
  tamano_bytes: number
  created_at: string
  updated_at: string
}

// Servicios para Cotizaciones
export const cotizacionesService = {
  // Crear una nueva cotización
  async create(data: Omit<Cotizacion, 'id' | 'created_at' | 'updated_at'>): Promise<Cotizacion> {
    const { data: cotizacion, error } = await supabase
      .from('cotizaciones')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return cotizacion
  },

  // Obtener cotización por ID con segmentos
  async getById(id: string): Promise<Cotizacion & { segmentos: Segmento[] }> {
    const { data: cotizacion, error: cotError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .single()

    if (cotError) throw cotError

    // Usar la función específica para obtener segmentos por cotización
    const segmentos = await segmentosService.getByCotizacion(id)

    return {
      ...cotizacion,
      segmentos: segmentos || [],
    }
  },

  // Listar todas las cotizaciones
  async list(): Promise<Cotizacion[]> {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Actualizar cotización
  async update(id: string, data: Partial<Cotizacion>): Promise<Cotizacion> {
    const { data: cotizacion, error } = await supabase
      .from('cotizaciones')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return cotizacion
  },

  // Eliminar cotización
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('cotizaciones').delete().eq('id', id)

    if (error) throw error
  },
}

// Servicios para Segmentos
export const segmentosService = {
  // Crear segmento básico
  async create(
    segmentoData: Omit<Segmento, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Segmento> {
    const { data: segmento, error: segError } = await supabase
      .from('segmentos')
      .insert(segmentoData)
      .select()
      .single()

    if (segError) throw segError

    return segmento
  },

  // Crear segmento de transporte completo
  async createTransporte(
    segmentoData: Omit<Segmento, 'id' | 'created_at' | 'updated_at'>,
    transporteData: Omit<SegmentoTransporte, 'id' | 'segmento_id' | 'created_at' | 'updated_at'>,
  ): Promise<Segmento> {
    // Crear segmento base
    const { data: segmento, error: segError } = await supabase
      .from('segmentos')
      .insert({
        ...segmentoData,
        tipo: 'transporte',
      })
      .select()
      .single()

    if (segError) throw segError

    // Crear datos específicos de transporte
    const { data: transporte, error: transError } = await supabase
      .from('segmento_transporte')
      .insert({
        ...transporteData,
        segmento_id: segmento.id,
      })
      .select()
      .single()

    if (transError) throw transError

    return {
      ...segmento,
      segmento_transporte: transporte,
    }
  },

  // Crear segmento de hospedaje completo
  async createHospedaje(
    segmentoData: Omit<Segmento, 'id' | 'created_at' | 'updated_at'>,
    hospedajeData: Omit<SegmentoHospedaje, 'id' | 'segmento_id' | 'created_at' | 'updated_at'>,
  ): Promise<Segmento> {
    // Crear segmento base
    const { data: segmento, error: segError } = await supabase
      .from('segmentos')
      .insert({
        ...segmentoData,
        tipo: 'hospedaje',
      })
      .select()
      .single()

    if (segError) throw segError

    // Crear datos específicos de hospedaje
    const { data: hospedaje, error: hospError } = await supabase
      .from('segmento_hospedaje')
      .insert({
        ...hospedajeData,
        segmento_id: segmento.id,
      })
      .select()
      .single()

    if (hospError) throw hospError

    return {
      ...segmento,
      segmento_hospedaje: hospedaje,
    }
  },

  // Crear segmento de actividad completo
  async createActividad(
    segmentoData: Omit<Segmento, 'id' | 'created_at' | 'updated_at'>,
    actividadData: Omit<SegmentoActividad, 'id' | 'segmento_id' | 'created_at' | 'updated_at'>,
  ): Promise<Segmento> {
    // Crear segmento base
    const { data: segmento, error: segError } = await supabase
      .from('segmentos')
      .insert({
        ...segmentoData,
        tipo: 'actividad',
      })
      .select()
      .single()

    if (segError) throw segError

    // Crear datos específicos de actividad
    const { data: actividad, error: actError } = await supabase
      .from('segmento_actividad')
      .insert({
        ...actividadData,
        segmento_id: segmento.id,
      })
      .select()
      .single()

    if (actError) throw actError

    return {
      ...segmento,
      segmento_actividad: actividad,
    }
  },

  // Obtener segmento por ID con datos específicos
  async getById(id: string): Promise<Segmento> {
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
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Obtener segmentos por viaje
  async getByViaje(viajeId: string): Promise<Segmento[]> {
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
      .eq('viaje_id', viajeId)
      .order('orden', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Obtener segmentos por cotización
  async getByCotizacion(cotizacionId: string): Promise<Segmento[]> {
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
      .eq('cotizacion_id', cotizacionId)
      .order('orden', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Actualizar segmento
  async update(id: string, data: Partial<Segmento>): Promise<Segmento> {
    const { data: segmento, error } = await supabase
      .from('segmentos')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return segmento
  },

  // Eliminar segmento
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('segmentos').delete().eq('id', id)

    if (error) throw error
  },
}

// Servicios para Documentos
export const documentosService = {
  // Subir archivo a Supabase Storage
  async uploadFile(file: File, segmentoId: string): Promise<Documento> {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `segmentos/${segmentoId}/${fileName}`

    // Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage.from('documentos').upload(filePath, file)

    if (uploadError) throw uploadError

    // Guardar metadata en la tabla documentos
    const { data: documento, error: docError } = await supabase
      .from('documentos')
      .insert({
        segmento_id: segmentoId,
        nombre_archivo: file.name,
        ruta_storage: filePath,
        tipo_archivo: file.type,
        tamano_bytes: file.size,
      })
      .select()
      .single()

    if (docError) throw docError

    return documento
  },

  // Obtener documentos de un segmento
  async getBySegmento(segmentoId: string): Promise<Documento[]> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('segmento_id', segmentoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Eliminar documento
  async delete(id: string): Promise<void> {
    // Primero obtener el documento para saber la ruta del archivo
    const { data: documento, error: getError } = await supabase
      .from('documentos')
      .select('ruta_storage')
      .eq('id', id)
      .single()

    if (getError) throw getError

    // Eliminar archivo de Storage
    if (documento?.ruta_storage) {
      await supabase.storage.from('documentos').remove([documento.ruta_storage])
    }

    // Eliminar registro de la base de datos
    const { error: deleteError } = await supabase.from('documentos').delete().eq('id', id)

    if (deleteError) throw deleteError
  },

  // Obtener URL pública de un documento
  getPublicUrl(rutaStorage: string): string {
    const { data } = supabase.storage.from('documentos').getPublicUrl(rutaStorage)

    return data.publicUrl
  },
}

// Servicios para Viajes
export const viajesService = {
  // Crear viaje
  async create(data: Omit<Viaje, 'id' | 'created_at' | 'updated_at'>): Promise<Viaje> {
    const { data: viaje, error } = await supabase.from('viajes').insert(data).select().single()

    if (error) throw error
    return viaje
  },

  // Crear viaje desde cotización
  async createFromCotizacion(cotizacionId: string, viajeroId?: string): Promise<Viaje> {
    // Obtener la cotización con segmentos directamente
    const { data: cotizacion, error: cotError } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', cotizacionId)
      .single()

    if (cotError) throw cotError

    // Obtener segmentos de la cotización
    const segmentos = await segmentosService.getByCotizacion(cotizacionId)

    // Determinar fechas del viaje basado en los segmentos
    const fechasSegmentos = segmentos
      .map((s) => s.fecha_inicio)
      .filter((f) => f)
      .sort()

    const fechaInicio = fechasSegmentos[0] || new Date().toISOString().split('T')[0]
    const fechaFin = fechasSegmentos[fechasSegmentos.length - 1] || fechaInicio

    // Crear el viaje
    const viajeData = {
      nombre: `Viaje desde ${cotizacion.nombre}`,
      descripcion: `Creado desde cotización ${cotizacion.nombre}`,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: 'por_iniciar' as const,
      progreso_porcentaje: 0,
      cotizacion_id: cotizacionId,
    }

    const { data: viaje, error: viajeError } = await supabase
      .from('viajes')
      .insert(viajeData)
      .select()
      .single()

    if (viajeError) throw viajeError

    // Copiar los segmentos al viaje
    for (const segmento of segmentos) {
      // Crear segmento para el viaje (cambiar cotizacion_id por viaje_id)
      const segmentoViajeData = {
        tipo: segmento.tipo,
        nombre: segmento.nombre,
        proveedor: segmento.proveedor,
        fecha_inicio: segmento.fecha_inicio,
        fecha_fin: segmento.fecha_fin,
        hora_inicio: segmento.hora_inicio,
        hora_fin: segmento.hora_fin,
        duracion: segmento.duracion,
        observaciones: segmento.observaciones,
        orden: segmento.orden,
        viaje_id: viaje.id,
      }

      const { error: segError } = await supabase
        .from('segmentos')
        .insert(segmentoViajeData)
        .select()
        .single()

      if (segError) throw segError

      // Los datos específicos ya se incluyen en el segmento original desde la cotización
      // No necesitamos crear tablas adicionales aquí ya que se copian automáticamente
    }

    // Asignar viajero al viaje si se especificó
    if (viajeroId) {
      await supabase.from('viaje_viajeroz').insert({
        viaje_id: viaje.id,
        viajero_id: viajeroId,
      })
    }

    return viaje
  },

  // Obtener viaje por ID con segmentos
  async getById(id: string): Promise<Viaje & { segmentos: Segmento[] }> {
    const { data: viaje, error: viajeError } = await supabase
      .from('viajes')
      .select('*')
      .eq('id', id)
      .single()

    if (viajeError) throw viajeError

    // Usar la función específica para obtener segmentos por viaje
    const segmentos = await segmentosService.getByViaje(id)

    return {
      ...viaje,
      segmentos: segmentos || [],
    }
  },

  // Listar viajes
  async list(): Promise<Viaje[]> {
    const { data, error } = await supabase
      .from('viajes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Actualizar viaje
  async update(id: string, data: Partial<Viaje>): Promise<Viaje> {
    const { data: viaje, error } = await supabase
      .from('viajes')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return viaje
  },

  // Eliminar viaje
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('viajes').delete().eq('id', id)

    if (error) throw error
  },

  // Obtener segmentos por viaje (alias para segmentosService.getByViaje)
  async getByViaje(viajeId: string): Promise<Segmento[]> {
    return segmentosService.getByViaje(viajeId)
  },
}

// Servicios para Viajeroz
export const viajerozService = {
  // Crear viajero
  async create(data: Omit<Viajeroz, 'id' | 'created_at' | 'updated_at'>): Promise<Viajeroz> {
    const { data: viajero, error } = await supabase.from('viajeroz').insert(data).select().single()

    if (error) throw error
    return viajero
  },

  // Obtener viajero por ID
  async getById(id: string): Promise<Viajeroz> {
    const { data, error } = await supabase.from('viajeroz').select('*').eq('id', id).single()

    if (error) throw error
    return data
  },

  // Login de viajero (con dos parámetros)
  async login(identidad: string, telefono: string): Promise<Viajeroz> {
    const { data, error } = await supabase
      .from('viajeroz')
      .select('*')
      .eq('identidad', identidad)
      .eq('telefono', telefono)
      .single()

    if (error) throw error
    return data
  },

  // Listar todos los viajeroz
  async list(): Promise<Viajeroz[]> {
    const { data, error } = await supabase
      .from('viajeroz')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Actualizar viajero
  async update(id: string, data: Partial<Viajeroz>): Promise<Viajeroz> {
    const { data: viajero, error } = await supabase
      .from('viajeroz')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return viajero
  },

  // Eliminar viajero
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('viajeroz').delete().eq('id', id)

    if (error) throw error
  },
}

// Función de prueba de conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    // console.log('🔍 Probando conexión con Supabase...')

    // Intentar una consulta simple para verificar la conexión
    const { error } = await supabase.from('viajeroz').select('count').limit(1)

    if (error) {
      console.error('❌ Error de conexión:', error.message)
      return false
    }

    // console.log('✅ Conexión exitosa con la base de datos "viajemoz"')
    // console.log('📊 Estado de la conexión:', {
    //   url: supabaseUrl,
    //   conectado: true,
    //   timestamp: new Date().toISOString(),
    // })

    return true
  } catch (error) {
    console.error('❌ Error al probar conexión:', error)
    return false
  }
}
