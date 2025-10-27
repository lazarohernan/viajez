import { supabase } from '@/services/supabase'

export interface Hotel {
  id?: string
  nombre: string
  created_at?: string
  updated_at?: string
}

export class HotelesService {
  /**
   * Obtener todos los hoteles ordenados alfabéticamente
   */
  static async getAll(): Promise<{ data: Hotel[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('hoteles')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) {
        console.error('❌ Error obteniendo hoteles:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('❌ Error en getAll hoteles:', err)
      return { data: null, error: 'Error al obtener la lista de hoteles' }
    }
  }

  /**
   * Buscar hoteles por nombre
   */
  static async search(query: string): Promise<{ data: Hotel[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('hoteles')
        .select('*')
        .ilike('nombre', `%${query}%`)
        .order('nombre', { ascending: true })

      if (error) {
        console.error('❌ Error buscando hoteles:', error)
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      console.error('❌ Error en search hoteles:', err)
      return { data: null, error: 'Error al buscar hoteles' }
    }
  }

  /**
   * Agregar un nuevo hotel
   */
  static async create(nombre: string): Promise<{ data: Hotel | null; error: string | null }> {
    try {
      // Primero verificar si ya existe
      const { data: existing, error: checkError } = await supabase
        .from('hoteles')
        .select('id')
        .eq('nombre', nombre)
        .maybeSingle()

      if (checkError) {
        console.error('❌ Error verificando hotel existente:', checkError)
        return { data: null, error: checkError.message }
      }

      if (existing) {
        return { data: null, error: 'El hotel ya existe' }
      }

      const { data, error } = await supabase
        .from('hoteles')
        .insert([{ nombre: nombre.trim() }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error creando hotel:', error)
        return { data: null, error: error.message }
      }

      console.log('✅ Hotel creado exitosamente:', data)
      return { data, error: null }
    } catch (err) {
      console.error('❌ Error en create hotel:', err)
      return { data: null, error: 'Error al crear el hotel' }
    }
  }

  /**
   * Verificar si un hotel existe
   */
  static async exists(nombre: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('hoteles')
        .select('id')
        .eq('nombre', nombre.trim())
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('❌ Error verificando existencia de hotel:', error)
        return false
      }

      return !!data
    } catch (err) {
      console.error('❌ Error en exists hotel:', err)
      return false
    }
  }
}
