-- Migración: Crear tabla de hoteles
-- Fecha: Octubre 2025
-- Descripción: Tabla para almacenar nombres de hoteles agregados por usuarios

-- Crear tabla de hoteles
CREATE TABLE IF NOT EXISTS hoteles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_hoteles_nombre ON hoteles(nombre);

-- Políticas RLS (Row Level Security)
ALTER TABLE hoteles ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "hoteles_select_policy" ON hoteles
FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "hoteles_insert_policy" ON hoteles
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "hoteles_update_policy" ON hoteles
FOR UPDATE USING (auth.role() = 'authenticated');
