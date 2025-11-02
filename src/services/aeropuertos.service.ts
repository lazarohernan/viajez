import { supabase } from '@/services/supabase'
import { AEROPUERTOS } from '@/data/aeropuertos'

export interface Aeropuerto {
  id?: string
  ciudad: string
  nombre: string
  codigo: string
  pais?: string
  created_at?: string
  updated_at?: string
}

export class AeropuertosService {
  /**
   * Obtener todos los aeropuertos (estáticos + de BD)
   */
  static async getAll(): Promise<{ data: Aeropuerto[] | null; error: string | null }> {
    try {
      // Obtener aeropuertos de la base de datos
      const { data: aeropuertosBD, error: dbError } = await supabase
        .from('aeropuertos')
        .select('*')
        .order('ciudad', { ascending: true })

      if (dbError) {
        console.error('❌ Error obteniendo aeropuertos de BD:', dbError)
        // Si hay error en BD, retornar solo los estáticos
        const aeropuertosEstaticos = AEROPUERTOS.map((ap) => ({
          id: ap.codigo,
          ciudad: ap.ciudad,
          nombre: ap.nombre,
          codigo: ap.codigo,
          pais: ap.pais,
        })).sort((a, b) => a.ciudad.localeCompare(b.ciudad))

        return { data: aeropuertosEstaticos, error: null }
      }

      // Convertir aeropuertos de BD al formato esperado
      const aeropuertosBaseDatos = (aeropuertosBD || []).map((ap) => ({
        id: ap.id,
        ciudad: ap.ciudad,
        nombre: ap.nombre,
        codigo: ap.codigo,
        pais: ap.pais,
      }))

      // Obtener aeropuertos estáticos
      const aeropuertosEstaticos = AEROPUERTOS.map((ap) => ({
        id: ap.codigo,
        ciudad: ap.ciudad,
        nombre: ap.nombre,
        codigo: ap.codigo,
        pais: ap.pais,
      }))

      // Combinar y eliminar duplicados por código (prioridad a BD)
      const todosAeropuertos = [...aeropuertosEstaticos, ...aeropuertosBaseDatos]
      const aeropuertosUnicos = todosAeropuertos.filter(
        (ap, index, self) => index === self.findIndex((a) => a.codigo === ap.codigo),
      )

      // Ordenar alfabéticamente por ciudad
      aeropuertosUnicos.sort((a, b) => a.ciudad.localeCompare(b.ciudad))

      return { data: aeropuertosUnicos, error: null }
    } catch (err) {
      console.error('❌ Error obteniendo aeropuertos:', err)
      return { data: null, error: 'Error al obtener aeropuertos' }
    }
  }

  /**
   * Buscar aeropuertos por ciudad, nombre o código (estáticos + BD)
   */
  static async search(query: string): Promise<{ data: Aeropuerto[] | null; error: string | null }> {
    try {
      if (!query.trim()) {
        return this.getAll()
      }

      const busqueda = query.toLowerCase()

      // Obtener aeropuertos de BD que coincidan
      const { data: aeropuertosBDFiltrados, error: dbError } = await supabase
        .from('aeropuertos')
        .select('*')
        .or(
          `ciudad.ilike.%${query}%,nombre.ilike.%${query}%,codigo.ilike.%${query}%,pais.ilike.%${query}%`,
        )
        .order('ciudad', { ascending: true })

      // Obtener aeropuertos estáticos que coincidan
      const aeropuertosEstaticos = AEROPUERTOS.filter(
        (ap) =>
          ap.ciudad.toLowerCase().includes(busqueda) ||
          ap.nombre.toLowerCase().includes(busqueda) ||
          ap.codigo.toLowerCase().includes(busqueda) ||
          ap.pais.toLowerCase().includes(busqueda),
      ).map((ap) => ({
        id: ap.codigo,
        ciudad: ap.ciudad,
        nombre: ap.nombre,
        codigo: ap.codigo,
        pais: ap.pais,
      }))

      // Convertir resultados de BD
      const aeropuertosBaseDatos = dbError
        ? []
        : (aeropuertosBDFiltrados || []).map((ap) => ({
            id: ap.id,
            ciudad: ap.ciudad,
            nombre: ap.nombre,
            codigo: ap.codigo,
            pais: ap.pais,
          }))

      // Combinar y eliminar duplicados
      const todosAeropuertos = [...aeropuertosEstaticos, ...aeropuertosBaseDatos]
      const aeropuertosUnicos = todosAeropuertos.filter(
        (ap, index, self) => index === self.findIndex((a) => a.codigo === ap.codigo),
      )

      // Ordenar alfabéticamente por ciudad
      aeropuertosUnicos.sort((a, b) => a.ciudad.localeCompare(b.ciudad))

      return { data: aeropuertosUnicos, error: null }
    } catch (err) {
      console.error('❌ Error buscando aeropuertos:', err)
      return { data: null, error: 'Error al buscar aeropuertos' }
    }
  }

  /**
   * Agregar un nuevo aeropuerto a la base de datos
   */
  static async create(
    ciudad: string,
    nombre: string,
    codigo: string,
  ): Promise<{ data: Aeropuerto | null; error: string | null }> {
    try {
      const codigoNormalizado = codigo.toUpperCase().trim()

      // Verificar si ya existe
      if (await this.exists(codigoNormalizado)) {
        return { data: null, error: 'El aeropuerto con este código ya existe' }
      }

      const { data, error } = await supabase
        .from('aeropuertos')
        .insert([
          {
            ciudad: ciudad.trim(),
            nombre: nombre.trim(),
            codigo: codigoNormalizado,
            pais: 'Personalizado',
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creando aeropuerto:', error)
        return { data: null, error: error.message }
      }

      console.log('✅ Aeropuerto creado en BD:', data)
      return { data, error: null }
    } catch (err) {
      console.error('❌ Error creando aeropuerto:', err)
      return { data: null, error: 'Error al crear el aeropuerto' }
    }
  }

  /**
   * Verificar si un aeropuerto existe (estáticos + BD)
   */
  static async exists(codigo: string): Promise<boolean> {
    try {
      const codigoNormalizado = codigo.toUpperCase().trim()

      // Verificar en aeropuertos estáticos
      const existeEstatico = AEROPUERTOS.some((ap) => ap.codigo === codigoNormalizado)

      // Verificar en base de datos
      const { data, error } = await supabase
        .from('aeropuertos')
        .select('id')
        .eq('codigo', codigoNormalizado)
        .maybeSingle()

      const existeBD = !error && !!data

      return existeEstatico || existeBD
    } catch (err) {
      console.error('❌ Error verificando existencia de aeropuerto:', err)
      return false
    }
  }

  /**
   * Eliminar un aeropuerto de la base de datos
   */
  static async delete(codigo: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const codigoNormalizado = codigo.toUpperCase().trim()

      // Solo permitir eliminar aeropuertos de BD, no estáticos
      const existeEstatico = AEROPUERTOS.some((ap) => ap.codigo === codigoNormalizado)
      if (existeEstatico) {
        return { success: false, error: 'No se pueden eliminar aeropuertos predefinidos' }
      }

      const { error } = await supabase.from('aeropuertos').delete().eq('codigo', codigoNormalizado)

      if (error) {
        console.error('❌ Error eliminando aeropuerto:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Aeropuerto eliminado de BD:', codigoNormalizado)
      return { success: true, error: null }
    } catch (err) {
      console.error('❌ Error eliminando aeropuerto:', err)
      return { success: false, error: 'Error al eliminar el aeropuerto' }
    }
  }

  /**
   * Limpiar todos los aeropuertos personalizados de la BD
   */
  static async clearCustomAirports(): Promise<{ success: boolean; error: string | null }> {
    try {
      // Eliminar todos los aeropuertos donde pais = 'Personalizado'
      const { error } = await supabase.from('aeropuertos').delete().eq('pais', 'Personalizado')

      if (error) {
        console.error('❌ Error limpiando aeropuertos personalizados:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Todos los aeropuertos personalizados eliminados de BD')
      return { success: true, error: null }
    } catch (err) {
      console.error('❌ Error limpiando aeropuertos personalizados:', err)
      return { success: false, error: 'Error al limpiar aeropuertos personalizados' }
    }
  }
}
