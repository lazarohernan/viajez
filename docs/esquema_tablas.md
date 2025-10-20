## Esquema de Tablas ACTUALIZADO - Sistema Viajemoz

**Fecha de actualización:** 15 de Octubre, 2025
**Basado en conversación con cliente**

Nota: Este documento enumera las tablas y campos a crear. Incluye SQL para Supabase. Los nombres están en snake_case para consistencia. Se indican claves y relaciones de forma descriptiva.

---

### 1) viajeroz (antes clientes)

**Campos principales:**
- id (PK, UUID)
- nombre (string, requerido)
- apellido (string, requerido)
- email (string, requerido)
- telefono (string, requerido)
- identidad (string, requerido - para login)
- fecha_nacimiento (date, requerido - para cumpleaños)
- numero_pasaporte (string, opcional)
- fecha_vencimiento_pasaporte (date, opcional)
- numero_visa (string, opcional)
- pais_visa (string, opcional)
- tipo_visa (string, opcional)
- fecha_vencimiento_visa (date, opcional)
- pais_residencia (string, opcional)
- created_at (timestamp)
- updated_at (timestamp)

---

### 2) viajes

**Campos principales:**
- id (PK, UUID)
- nombre (string, requerido)
- descripcion (text, opcional)
- fecha_inicio (date, requerido)
- fecha_fin (date, opcional)
- estado (enum: 'por_iniciar', 'en_curso', 'finalizado', default: 'por_iniciar')
- progreso_porcentaje (integer, default: 0)
- segmento_actual_id (UUID, FK → segmentos.id, opcional)
- cotizacion_id (UUID, FK → cotizaciones.id, opcional - nullable)
- created_at (timestamp)
- updated_at (timestamp)

---

### 3) viaje_viajeroz (relación muchos a muchos)

Relación de viajeroz que forman parte de un viaje.

- id (PK, UUID)
- viaje_id (FK → viajes.id)
- viajero_id (FK → viajeroz.id)
- created_at (timestamp)

---

### 4) cotizaciones

**Campos principales:**
- id (PK, UUID)
- nombre (string, requerido)
- viajero_id (UUID, FK → viajeroz.id, opcional - nullable)
- estado (enum: 'borrador', 'enviada', 'aprobada', 'rechazada', default: 'borrador')
- created_at (timestamp)
- updated_at (timestamp)

---

### 5) segmentos

**Campos principales (comunes a todos los tipos):**
- id (PK, UUID)
- tipo (enum: 'transporte', 'hospedaje', 'actividad', requerido)
- nombre (string, requerido - nombre del segmento)
- proveedor (string, requerido - empresa/hotel/etc)
- fecha_inicio (date, requerido)
- fecha_fin (date, opcional - nullable, para segmentos solo de ida)
- hora_inicio (time, opcional)
- hora_fin (time, opcional)
- duracion (string, calculada automáticamente)
- observaciones (text, opcional - comentarios adicionales)
- orden (integer, para ordenamiento por fecha)
- cotizacion_id (UUID, FK → cotizaciones.id, opcional - nullable)
- viaje_id (UUID, FK → viajes.id, opcional - nullable)
- created_at (timestamp)
- updated_at (timestamp)

**Nota:** Un segmento puede estar en una cotización O en un viaje, pero no en ambos.

---

### 6) segmento_transporte (extensión de segmentos)

**Campos específicos para transporte:**
- id (PK, UUID)
- segmento_id (FK → segmentos.id)
- tipo_transporte (enum: 'aereo', 'tren', 'bus', 'carro_privado', 'uber', 'otro', requerido)
- tiene_retorno (boolean, default: true - indica si es ida y vuelta)
- origen (string, opcional)
- destino (string, opcional)
- created_at (timestamp)
- updated_at (timestamp)

---

### 7) segmento_hospedaje (extensión de segmentos)

**Campos específicos para hospedaje:**
- id (PK, UUID)
- segmento_id (FK → segmentos.id)
- tipo_hospedaje (enum: 'hotel', 'renta_privada', 'airbnb', 'otro', requerido)
- numero_habitaciones (integer, opcional)
- created_at (timestamp)
- updated_at (timestamp)

---

### 8) segmento_actividad (extensión de segmentos)

**Campos específicos para actividades:**
- id (PK, UUID)
- segmento_id (FK → segmentos.id)
- duracion_horas (decimal, opcional)
- created_at (timestamp)
- updated_at (timestamp)

---

### 9) documentos (archivos adjuntos por segmento)

**Campos principales:**
- id (PK, UUID)
- segmento_id (FK → segmentos.id)
- nombre_archivo (string, requerido)
- ruta_storage (string, requerido - URL de Supabase Storage)
- tipo_archivo (string, requerido - MIME type)
- tamano_bytes (integer, requerido)
- created_at (timestamp)
- updated_at (timestamp)

---

## Reglas/validaciones sugeridas

### Reglas de negocio:
- **Un segmento** puede estar en una cotización O en un viaje, pero no en ambos
- **Login de viajeros** requiere exactamente 2 parámetros: identidad + teléfono (u otro campo)
- **Segmentos de transporte** pueden ser solo ida (tiene_retorno = false)
- **Duración** se calcula automáticamente: fecha_fin - fecha_inicio (si existe fecha_fin)
- **Orden de segmentos** se determina por fecha_inicio + hora_inicio

### Validaciones por tipo de segmento:
- **Transporte**: Requiere proveedor y tipo_transporte
- **Hospedaje**: Requiere proveedor y tipo_hospedaje
- **Actividad**: Requiere nombre (el proveedor es opcional)

### Relaciones:
- Un viajero puede tener múltiples viajes
- Un viaje puede tener múltiples viajeros
- Una cotización puede tener múltiples segmentos
- Un viaje puede tener múltiples segmentos
- Un segmento puede tener múltiples documentos adjuntos

---

## SQL para crear las tablas en Supabase

```sql
-- 1. Tabla viajeroz
CREATE TABLE viajeroz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefono TEXT NOT NULL,
  identidad TEXT NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  numero_pasaporte TEXT,
  fecha_vencimiento_pasaporte DATE,
  numero_visa TEXT,
  pais_visa TEXT,
  tipo_visa TEXT,
  fecha_vencimiento_visa DATE,
  pais_residencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabla viajes
CREATE TABLE viajes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  estado TEXT CHECK (estado IN ('por_iniciar', 'en_curso', 'finalizado')) DEFAULT 'por_iniciar',
  progreso_porcentaje INTEGER DEFAULT 0 CHECK (progreso_porcentaje >= 0 AND progreso_porcentaje <= 100),
  segmento_actual_id UUID,
  cotizacion_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla viaje_viajeroz (relación muchos a muchos)
CREATE TABLE viaje_viajeroz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viaje_id UUID NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  viajero_id UUID NOT NULL REFERENCES viajeroz(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(viaje_id, viajero_id)
);

-- 4. Tabla cotizaciones
CREATE TABLE cotizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  viajero_id UUID REFERENCES viajeroz(id) ON DELETE SET NULL,
  estado TEXT CHECK (estado IN ('borrador', 'enviada', 'aprobada', 'rechazada')) DEFAULT 'borrador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabla segmentos
CREATE TABLE segmentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT CHECK (tipo IN ('transporte', 'hospedaje', 'actividad')) NOT NULL,
  nombre TEXT NOT NULL,
  proveedor TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  hora_inicio TIME,
  hora_fin TIME,
  duracion TEXT,
  observaciones TEXT,
  orden INTEGER,
  cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE CASCADE,
  viaje_id UUID REFERENCES viajes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CHECK (
    (cotizacion_id IS NOT NULL AND viaje_id IS NULL) OR
    (cotizacion_id IS NULL AND viaje_id IS NOT NULL)
  )
);

-- 6. Tabla segmento_transporte
CREATE TABLE segmento_transporte (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  segmento_id UUID NOT NULL REFERENCES segmentos(id) ON DELETE CASCADE,
  tipo_transporte TEXT CHECK (tipo_transporte IN ('aereo', 'tren', 'bus', 'carro_privado', 'uber', 'otro')) NOT NULL,
  tiene_retorno BOOLEAN DEFAULT true,
  origen TEXT,
  destino TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Tabla segmento_hospedaje
CREATE TABLE segmento_hospedaje (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  segmento_id UUID NOT NULL REFERENCES segmentos(id) ON DELETE CASCADE,
  tipo_hospedaje TEXT CHECK (tipo_hospedaje IN ('hotel', 'renta_privada', 'airbnb', 'otro')) NOT NULL,
  numero_habitaciones INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Tabla segmento_actividad
CREATE TABLE segmento_actividad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  segmento_id UUID NOT NULL REFERENCES segmentos(id) ON DELETE CASCADE,
  duracion_horas DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Tabla documentos
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  segmento_id UUID NOT NULL REFERENCES segmentos(id) ON DELETE CASCADE,
  nombre_archivo TEXT NOT NULL,
  ruta_storage TEXT NOT NULL,
  tipo_archivo TEXT NOT NULL,
  tamano_bytes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejor performance
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_viajes_fecha_inicio ON viajes(fecha_inicio);
CREATE INDEX idx_segmentos_cotizacion ON segmentos(cotizacion_id);
CREATE INDEX idx_segmentos_viaje ON segmentos(viaje_id);
CREATE INDEX idx_segmentos_fecha_inicio ON segmentos(fecha_inicio);
CREATE INDEX idx_viajeroz_identidad ON viajeroz(identidad);
CREATE INDEX idx_viajeroz_email ON viajeroz(email);

-- Políticas RLS (Row Level Security)
ALTER TABLE viajeroz ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE viaje_viajeroz ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmento_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmento_hospedaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmento_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
```

---

## Notas importantes

### Funcionalidades críticas implementadas:
1. **Sistema de segmentos múltiples** por cotización/viaje
2. **Archivos adjuntos** por segmento (reservas, boletos, confirmaciones)
3. **Login de viajeros** con 2 parámetros de seguridad
4. **Creación de viajes desde cotizaciones**
5. **Estados de viaje** con progreso automático
6. **Campos adicionales** para cumpleaños, vencimientos de pasaportes/visas

### Próximos pasos técnicos:
- Crear las tablas en Supabase usando el SQL arriba
- Configurar Storage bucket para documentos
- Crear políticas RLS específicas para cada tabla
- Implementar las funciones de Vue.js para conectar con Supabase
- Sistema de PDFs con templates personalizables
- Sistema de correos manual
