import { supabase } from './supabase'
import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Servicio base con utilidades comunes para todos los servicios
 */
export class BaseService {
  protected handleError(error: PostgrestError | Error | null): never {
    if (error) {
      console.error('Database error:', error)
      throw new Error(error.message || 'An error occurred while processing your request')
    }
    throw new Error('Unknown error occurred')
  }

  protected async checkAuth(): Promise<void> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      throw new Error('User not authenticated')
    }
  }

  protected formatDate(date: string | Date): string {
    if (typeof date === 'string') return date
    return date.toISOString().split('T')[0]
  }

  protected formatDateTime(date: string | Date): string {
    if (typeof date === 'string') return date
    return date.toISOString()
  }
}

/**
 * Tipos comunes para respuestas de servicios
 */
export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  error: string | null
}

/**
 * Utilidades para manejo de archivos
 */
export class FileService extends BaseService {
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
  ): Promise<ServiceResponse<{ path: string; url: string }>> {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file)
      if (error) this.handleError(error)

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

      return {
        data: { path: data.path, url: urlData.publicUrl },
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  async deleteFile(bucket: string, path: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) this.handleError(error)

      return { data: true, error: null }
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      }
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
}

// Instancia global del servicio de archivos
export const fileService = new FileService()
