-- ============================================
-- OPTIMIZACIONES PARA EL DASHBOARD
-- ViajeMoz - Sistema de Gestión de Viajes
-- Fecha: 23 de Octubre, 2025
-- ============================================

-- ============================================
-- 1. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índice para búsquedas por fecha de vencimiento de pasaporte
-- Mejora queries de PasaportesPorVencer.vue
CREATE INDEX IF NOT EXISTS idx_viajeroz_pasaporte_vencimiento 
ON viajeroz(fecha_vencimiento_pasaporte) 
WHERE numero_pasaporte IS NOT NULL 
  AND fecha_vencimiento_pasaporte IS NOT NULL;

-- Índice para búsquedas por fecha de vencimiento de visa
-- Mejora queries de VisasPorVencer.vue
CREATE INDEX IF NOT EXISTS idx_viajeroz_visa_vencimiento 
ON viajeroz(fecha_vencimiento_visa) 
WHERE numero_visa IS NOT NULL 
  AND fecha_vencimiento_visa IS NOT NULL;

-- Índice para búsquedas por fecha de nacimiento
-- Mejora queries de CumpleanosHoy.vue
CREATE INDEX IF NOT EXISTS idx_viajeroz_fecha_nacimiento 
ON viajeroz(fecha_nacimiento) 
WHERE fecha_nacimiento IS NOT NULL;

-- Índice para viajes activos
-- Mejora queries de ViajesEnCurso.vue y EstadisticasGenerales.vue
CREATE INDEX IF NOT EXISTS idx_viajes_estado_fecha 
ON viajes(estado, fecha_inicio) 
WHERE estado IN ('en_curso', 'por_iniciar');

-- Índice para cotizaciones por fecha de creación
-- Mejora queries de EstadisticasGenerales.vue (consultas del día)
CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_at 
ON cotizaciones(created_at DESC);

-- Índice para segmentos por viaje
-- Mejora queries de ViajesEnCurso.vue
CREATE INDEX IF NOT EXISTS idx_segmentos_viaje_fecha 
ON segmentos(viaje_id, fecha_inicio) 
WHERE viaje_id IS NOT NULL;

-- Índice compuesto para viajeros activos
CREATE INDEX IF NOT EXISTS idx_viajeroz_activo 
ON viajeroz(activo) 
WHERE activo = true;


-- ============================================
-- 2. FUNCIÓN: CUMPLEAÑOS DEL MES ACTUAL
-- ============================================
-- Optimiza CumpleanosHoy.vue moviendo el filtrado a la BD

CREATE OR REPLACE FUNCTION get_cumpleanos_mes_actual()
RETURNS TABLE (
  id uuid,
  nombre text,
  apellido text,
  email text,
  telefono text,
  fecha_nacimiento date,
  dias_para_cumpleanos integer,
  mes integer,
  dia integer
) 
LANGUAGE plpgsql
AS $$
DECLARE
  mes_actual integer;
  dia_actual integer;
BEGIN
  mes_actual := EXTRACT(MONTH FROM CURRENT_DATE)::integer;
  dia_actual := EXTRACT(DAY FROM CURRENT_DATE)::integer;
  
  RETURN QUERY
  SELECT 
    v.id,
    v.nombre,
    v.apellido,
    v.email,
    v.telefono,
    v.fecha_nacimiento,
    (EXTRACT(DAY FROM v.fecha_nacimiento)::integer - dia_actual) as dias_para_cumpleanos,
    EXTRACT(MONTH FROM v.fecha_nacimiento)::integer as mes,
    EXTRACT(DAY FROM v.fecha_nacimiento)::integer as dia
  FROM viajeroz v
  WHERE v.fecha_nacimiento IS NOT NULL
    AND EXTRACT(MONTH FROM v.fecha_nacimiento) = mes_actual
    AND EXTRACT(DAY FROM v.fecha_nacimiento) >= dia_actual
    AND v.activo = true
  ORDER BY EXTRACT(DAY FROM v.fecha_nacimiento);
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION get_cumpleanos_mes_actual() IS 
'Retorna los cumpleaños del mes actual que aún no han pasado, ordenados por día';


-- ============================================
-- 3. FUNCIÓN: PASAPORTES POR VENCER
-- ============================================
-- Optimiza PasaportesPorVencer.vue

CREATE OR REPLACE FUNCTION get_pasaportes_por_vencer(dias_limite integer DEFAULT 90)
RETURNS TABLE (
  id uuid,
  nombre text,
  apellido text,
  email text,
  telefono text,
  pais_residencia text,
  numero_pasaporte text,
  fecha_vencimiento_pasaporte date,
  dias_restantes integer,
  estado text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.nombre,
    v.apellido,
    v.email,
    v.telefono,
    COALESCE(v.pais_residencia, 'No especificada') as pais_residencia,
    v.numero_pasaporte,
    v.fecha_vencimiento_pasaporte,
    (v.fecha_vencimiento_pasaporte - CURRENT_DATE)::integer as dias_restantes,
    CASE 
      WHEN (v.fecha_vencimiento_pasaporte - CURRENT_DATE) <= 0 THEN 'Vencido'
      WHEN (v.fecha_vencimiento_pasaporte - CURRENT_DATE) <= 30 THEN 'Por Vencer'
      ELSE 'Activo'
    END as estado
  FROM viajeroz v
  WHERE v.numero_pasaporte IS NOT NULL
    AND v.fecha_vencimiento_pasaporte IS NOT NULL
    AND v.fecha_vencimiento_pasaporte >= CURRENT_DATE
    AND v.fecha_vencimiento_pasaporte <= CURRENT_DATE + dias_limite
    AND v.activo = true
  ORDER BY v.fecha_vencimiento_pasaporte ASC;
END;
$$;

COMMENT ON FUNCTION get_pasaportes_por_vencer(integer) IS 
'Retorna pasaportes que vencen en los próximos N días (default 90)';


-- ============================================
-- 4. FUNCIÓN: VISAS POR VENCER
-- ============================================
-- Optimiza VisasPorVencer.vue

CREATE OR REPLACE FUNCTION get_visas_por_vencer(dias_limite integer DEFAULT 90)
RETURNS TABLE (
  id uuid,
  nombre text,
  apellido text,
  email text,
  telefono text,
  pais_visa text,
  tipo_visa text,
  numero_visa text,
  fecha_vencimiento_visa date,
  dias_restantes integer,
  estado text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.nombre,
    v.apellido,
    v.email,
    v.telefono,
    COALESCE(v.pais_visa, 'No especificado') as pais_visa,
    COALESCE(v.tipo_visa, 'No especificado') as tipo_visa,
    v.numero_visa,
    v.fecha_vencimiento_visa,
    (v.fecha_vencimiento_visa - CURRENT_DATE)::integer as dias_restantes,
    CASE 
      WHEN (v.fecha_vencimiento_visa - CURRENT_DATE) <= 0 THEN 'Vencida'
      WHEN (v.fecha_vencimiento_visa - CURRENT_DATE) <= 30 THEN 'Por Vencer'
      ELSE 'Activa'
    END as estado
  FROM viajeroz v
  WHERE v.numero_visa IS NOT NULL
    AND v.fecha_vencimiento_visa IS NOT NULL
    AND v.fecha_vencimiento_visa >= CURRENT_DATE
    AND v.fecha_vencimiento_visa <= CURRENT_DATE + dias_limite
    AND v.activo = true
  ORDER BY v.fecha_vencimiento_visa ASC;
END;
$$;

COMMENT ON FUNCTION get_visas_por_vencer(integer) IS 
'Retorna visas que vencen en los próximos N días (default 90)';


-- ============================================
-- 5. VISTA MATERIALIZADA: ESTADÍSTICAS DASHBOARD
-- ============================================
-- Optimiza EstadisticasGenerales.vue consolidando queries

CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  -- Total de clientes activos
  (SELECT COUNT(*) FROM viajeroz WHERE activo = true) as total_clientes,
  
  -- Viajes activos (en curso)
  (SELECT COUNT(*) FROM viajes WHERE estado = 'en_curso') as viajes_activos,
  
  -- Pasaportes por vencer (próximos 90 días)
  (SELECT COUNT(*) FROM viajeroz 
   WHERE numero_pasaporte IS NOT NULL 
     AND fecha_vencimiento_pasaporte IS NOT NULL
     AND fecha_vencimiento_pasaporte >= CURRENT_DATE
     AND fecha_vencimiento_pasaporte <= CURRENT_DATE + INTERVAL '90 days'
     AND activo = true) as pasaportes_por_vencer,
  
  -- Visas por vencer (próximos 90 días)
  (SELECT COUNT(*) FROM viajeroz 
   WHERE numero_visa IS NOT NULL 
     AND fecha_vencimiento_visa IS NOT NULL
     AND fecha_vencimiento_visa >= CURRENT_DATE
     AND fecha_vencimiento_visa <= CURRENT_DATE + INTERVAL '90 days'
     AND activo = true) as visas_por_vencer,
  
  -- Timestamp de última actualización
  CURRENT_TIMESTAMP as ultima_actualizacion;

-- Índice para acceso rápido
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_unique ON dashboard_stats (total_clientes);

-- Comentario
COMMENT ON MATERIALIZED VIEW dashboard_stats IS 
'Vista materializada con estadísticas generales del dashboard. Refrescar periódicamente.';


-- ============================================
-- 6. FUNCIÓN: REFRESCAR ESTADÍSTICAS
-- ============================================
-- Función helper para refrescar la vista materializada

CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$;

COMMENT ON FUNCTION refresh_dashboard_stats() IS 
'Refresca la vista materializada de estadísticas del dashboard';


-- ============================================
-- 7. FUNCIÓN: ESTADÍSTICAS COMPLETAS
-- ============================================
-- Retorna todas las estadísticas incluyendo las dinámicas

CREATE OR REPLACE FUNCTION get_dashboard_stats_completas()
RETURNS TABLE (
  total_clientes bigint,
  viajes_activos bigint,
  pasaportes_por_vencer bigint,
  visas_por_vencer bigint,
  cumpleanos_hoy bigint,
  consultas_hoy bigint
) 
LANGUAGE plpgsql
AS $$
DECLARE
  mes_actual integer;
  dia_actual integer;
BEGIN
  mes_actual := EXTRACT(MONTH FROM CURRENT_DATE)::integer;
  dia_actual := EXTRACT(DAY FROM CURRENT_DATE)::integer;
  
  RETURN QUERY
  SELECT 
    -- De la vista materializada
    ds.total_clientes,
    ds.viajes_activos,
    ds.pasaportes_por_vencer,
    ds.visas_por_vencer,
    
    -- Cumpleaños hoy (calculado en tiempo real)
    (SELECT COUNT(*) FROM viajeroz 
     WHERE fecha_nacimiento IS NOT NULL
       AND EXTRACT(MONTH FROM fecha_nacimiento) = mes_actual
       AND EXTRACT(DAY FROM fecha_nacimiento) = dia_actual
       AND activo = true)::bigint as cumpleanos_hoy,
    
    -- Consultas hoy (calculado en tiempo real)
    (SELECT COUNT(*) FROM cotizaciones 
     WHERE created_at >= CURRENT_DATE 
       AND created_at < CURRENT_DATE + INTERVAL '1 day')::bigint as consultas_hoy
  FROM dashboard_stats ds;
END;
$$;

COMMENT ON FUNCTION get_dashboard_stats_completas() IS 
'Retorna todas las estadísticas del dashboard combinando datos de la vista materializada y cálculos en tiempo real';


-- ============================================
-- 8. TRIGGER: AUTO-REFRESH DE ESTADÍSTICAS
-- ============================================
-- Opcional: Refrescar automáticamente cuando cambian los datos

-- Función trigger
CREATE OR REPLACE FUNCTION trigger_refresh_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refrescar en background (no bloquea la operación)
  PERFORM refresh_dashboard_stats();
  RETURN NEW;
END;
$$;

-- Triggers en tablas relevantes (comentados por defecto, descomentar si se desea)
-- NOTA: Puede impactar rendimiento en operaciones masivas

/*
CREATE TRIGGER refresh_stats_on_viajero_change
AFTER INSERT OR UPDATE OR DELETE ON viajeroz
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_dashboard_stats();

CREATE TRIGGER refresh_stats_on_viaje_change
AFTER INSERT OR UPDATE OR DELETE ON viajes
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_dashboard_stats();
*/


-- ============================================
-- 9. POLÍTICAS RLS (Row Level Security)
-- ============================================
-- Asegurar que los administradores puedan acceder a todas las funciones

-- Permitir ejecución de funciones a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_cumpleanos_mes_actual() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pasaportes_por_vencer(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_visas_por_vencer(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats_completas() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_dashboard_stats() TO authenticated;

-- Permitir lectura de la vista materializada
GRANT SELECT ON dashboard_stats TO authenticated;


-- ============================================
-- 10. JOB PROGRAMADO: REFRESCAR ESTADÍSTICAS
-- ============================================
-- Usar pg_cron para refrescar automáticamente cada hora
-- NOTA: Requiere extensión pg_cron habilitada

/*
-- Habilitar extensión (ejecutar como superusuario)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar refresh cada hora
SELECT cron.schedule(
  'refresh-dashboard-stats',
  '0 * * * *',  -- Cada hora en punto
  'SELECT refresh_dashboard_stats();'
);
*/


-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================

/*
-- 1. Ejecutar este script completo en Supabase SQL Editor

-- 2. Refrescar manualmente la vista materializada:
SELECT refresh_dashboard_stats();

-- 3. Obtener estadísticas completas:
SELECT * FROM get_dashboard_stats_completas();

-- 4. Obtener cumpleaños del mes:
SELECT * FROM get_cumpleanos_mes_actual();

-- 5. Obtener pasaportes por vencer (próximos 90 días):
SELECT * FROM get_pasaportes_por_vencer(90);

-- 6. Obtener visas por vencer (próximos 30 días):
SELECT * FROM get_visas_por_vencer(30);

-- 7. Ver estadísticas de la vista materializada:
SELECT * FROM dashboard_stats;
*/


-- ============================================
-- VERIFICACIÓN DE ÍNDICES
-- ============================================

-- Ver todos los índices creados
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_viajeroz%' OR
    indexname LIKE 'idx_viajes%' OR
    indexname LIKE 'idx_cotizaciones%' OR
    indexname LIKE 'idx_segmentos%'
  )
ORDER BY tablename, indexname;
*/


-- ============================================
-- ANÁLISIS DE RENDIMIENTO
-- ============================================

-- Ver estadísticas de uso de índices
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('viajeroz', 'viajes', 'cotizaciones', 'segmentos')
ORDER BY idx_scan DESC;
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
