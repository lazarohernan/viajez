# 📊 ANÁLISIS COMPLETO DEL SISTEMA VIAJEMOZ

**Fecha:** 13 de Octubre, 2025  
**Estado:** En Desarrollo

---

## 🎯 RESUMEN EJECUTIVO

El sistema Viajemoz es una plataforma de gestión de viajes con dos interfaces principales:
1. **Panel Administrativo**: Para gestión operativa de cotizaciones, viajes y viajeros
2. **Portal del Viajero**: Para que los clientes consulten sus itinerarios

---

## ✅ LO QUE YA ESTÁ IMPLEMENTADO

### 1. ESTRUCTURA BASE DEL PROYECTO
- ✅ Framework Vue 3 + TypeScript
- ✅ Tailwind CSS para estilos
- ✅ Router configurado
- ✅ Componentes base (Modal, DataTable)
- ✅ Sistema de navegación con sidebar
- ✅ Vista de login básica

### 2. MÓDULO DE VIAJEROZ (CLIENTES)
**Estado:** 80% completo

✅ **Implementado:**
- Vista principal con tabla de viajeroz
- Botón "Nuevo Viajeroz" estilizado en naranja
- Formulario ClientForm con campos:
  - Nombre
  - Apellido
  - Email
  - Teléfono
  - País de residencia
  - Número de pasaporte
  - Identidad
- Modal para crear/editar
- Búsqueda por nombre o email
- Nombre cambiado de "Clientes" a "Viajeroz"

❌ **Falta:**
- Campos adicionales:
  - Fecha de nacimiento (para cumpleaños)
  - Fecha de vencimiento de pasaporte
  - Fecha de vencimiento de visa
  - País de visa
  - Tipo de visa
- Integración con Supabase
- Sistema de archivos adjuntos para documentos
- Validación de dos parámetros para login del viajero

### 3. MÓDULO DE VIAJES
**Estado:** 60% completo

✅ **Implementado:**
- Vista principal con tabla de viajes
- Botón "Nuevo Viaje" en naranja
- Formulario ViajeForm con campos básicos:
  - Nombre del viaje
  - Descripción
  - Fecha inicio
  - Fecha fin
- Modal para crear/editar
- Botones de editar/abrir/eliminar
- Sistema para agregar personas al viaje
- ClientPickerModal para seleccionar viajeroz
- Colores naranja unificados

❌ **Falta:**
- **CRÍTICO:** Crear viaje desde cotización
- **CRÍTICO:** Sistema de segmentos dentro del viaje
- **CRÍTICO:** Subida de archivos/documentos por segmento (números de reserva)
- Poder agregar segmentos manualmente al viaje
- Edición de viaje creado desde cotización
- Estado del viaje (Por Iniciar, En Curso, Finalizado)
- Progreso del viaje (%)
- Segmento actual
- Integración con Supabase

### 4. MÓDULO DE COTIZACIONES
**Estado:** 70% completo

✅ **Implementado:**
- Vista principal con tres tarjetas de segmentos:
  - Transporte (ícono Plane)
  - Hospedaje (ícono Home)
  - Actividades (ícono Compass)
- Tabla para mostrar cotizaciones
- Modal con formularios específicos por segmento

**Formulario de Transporte:**
- ✅ Tipo: Aéreo, Tren, Bus, Carro Privado, Otro
- ✅ Proveedor
- ✅ Fecha inicial
- ✅ Fecha final (opcional)
- ✅ Hora salida
- ✅ Hora entrada
- ✅ Duración calculada automáticamente
- ✅ Observaciones

**Formulario de Hospedaje:**
- ✅ Tipo: Hotel, Renta Privada, Otro
- ✅ Proveedor
- ✅ Fecha entrada
- ✅ Fecha salida
- ✅ Duración calculada
- ✅ Observaciones

**Formulario de Actividades:**
- ✅ Nombre de la actividad
- ✅ Fecha inicial
- ✅ Fecha final
- ✅ Hora inicio
- ✅ Duración en horas
- ✅ Duración calculada
- ✅ Observaciones

❌ **Falta:**
- **CRÍTICO:** Sistema para agregar múltiples segmentos a una misma cotización
- **CRÍTICO:** Vista de resumen con todos los segmentos ordenados por fecha/hora
- **CRÍTICO:** Generación de PDF con formato personalizable
- Asignar cotización a un viajero
- Opción "Checkbox" para retorno en transporte
- Lista de cotizaciones guardadas con datos reales
- Integración con Supabase
- Convertir cotización a viaje

### 5. MÓDULO DE DASHBOARD
**Estado:** 40% completo

✅ **Implementado:**
- Estructura base con componentes separados:
  - EstadisticasGenerales
  - ViajesEnCurso
  - PasaportesPorVencer
  - VisasPorVencer
  - CumpleanosHoy
- Layout Bento Grid responsive
- Interfaces TypeScript definidas

❌ **Falta:**
- **CRÍTICO:** Datos reales desde Supabase
- **CRÍTICO:** Viajes en curso con:
  - Cliente actual
  - Ubicación actual (segmento activo)
  - Porcentaje de progreso
  - Estado visual
- Cálculo de días restantes para vencimientos
- Alertas visuales por urgencia
- Filtros y ordenamiento
- Click para ver detalle

### 6. SIDEBAR DE NAVEGACIÓN
**Estado:** 100% completo ✅

✅ **Implementado:**
- Sidebar flotante con expansión al hover
- Orden correcto:
  1. Dashboard
  2. Viajes
  3. Viajeroz (antes Clientes)
  4. Cotizaciones
- Íconos de Lucide
- Colores naranja corporativos
- Sección de Anexos eliminada
- Botón de salir

### 7. PORTAL DEL VIAJERO
**Estado:** 70% completo

✅ **Implementado (ClientViajesView.vue):**
- Interfaz completa con header del cliente
- Botón de logout
- Sistema de pestañas: "En Curso" y "Finalizados"
- Vista de viajes con:
  - Tarjetas de viaje con información
  - Barra de progreso visual (%)
  - Destino y fechas
- Lista de segmentos por viaje:
  - Transporte, Hospedaje, Actividades
  - Estados visuales: activo, inactivo, finalizado
  - Código de colores por estado (naranja, gris, verde)
- Modal de detalle de viaje con información completa
- Formateo de fechas en español
- Cálculo de duración de viajes
- Integración con AuthStore
- Datos mock funcionando
- Diseño responsive
- Estados vacíos con mensajes amigables

❌ **Falta:**
- Login con dos parámetros de seguridad (identidad + otro campo)
- **Sistema de descarga de archivos/documentos por segmento** (CRÍTICO)
- Conexión con Supabase para datos reales
- Filtrar viajes por usuario logueado (seguridad)
- Ver documentos adjuntos (reservas, boletos)
- Notificaciones/alertas de próximos segmentos

---

## ❌ LO QUE FALTA POR IMPLEMENTAR

### PRIORIDAD CRÍTICA 🔴

#### 1. PORTAL DEL VIAJERO (70% completo)
**Estado:** Base visual implementada, falta integración y archivos

✅ **Ya implementado en ClientViajesView.vue:**
- Interfaz completa con header del cliente
- Sistema de pestañas: "En Curso" y "Finalizados"
- Vista de viajes con progreso visual (%)
- Lista de segmentos por viaje (transporte, hospedaje, actividad)
- Estados de segmentos: activo, inactivo, finalizado
- Modal de detalle de viaje
- Formateo de fechas y duración
- Botón de logout
- Integración con authStore
- Datos mock funcionando

❌ **Falta implementar:**
- Login con dos parámetros de seguridad (identidad + teléfono u otro)
- **Sistema de descarga de archivos adjuntos** por segmento (CRÍTICO)
- Conexión con Supabase para datos reales
- Filtrar viajes por usuario logueado
- Verificación de que solo vea SUS viajes

**Estimación restante:** 2-3 días de desarrollo

#### 2. SISTEMA DE ARCHIVOS/DOCUMENTOS
**Descripción:** Subir y gestionar documentos en cada segmento

**Funcionalidades:**
- Subir archivos (PDF, imágenes) por segmento
- Almacenamiento en Supabase Storage
- Vista previa de archivos
- Descarga de documentos
- Eliminar archivos
- Visible tanto en admin como en portal viajero

**Afecta a:**
- Segmentos de Transporte (reservas, boletos)
- Segmentos de Hospedaje (confirmaciones)
- Segmentos de Actividades (vouchers)

**Estimación:** 2-3 días de desarrollo

#### 3. MÚLTIPLES SEGMENTOS POR COTIZACIÓN
**Descripción:** Poder agregar varios segmentos a una cotización

**Funcionalidades:**
- Lista de segmentos agregados
- Agregar segmento de cualquier tipo (Transporte, Hospedaje, Actividad)
- Editar segmento agregado
- Eliminar segmento
- Ver resumen ordenado por fecha/hora
- Guardar cotización completa con todos sus segmentos

**Componentes nuevos:**
- ListaSegmentos.vue (tabla de segmentos agregados)
- ResumenCotizacion.vue (vista previa del PDF)

**Estimación:** 2-3 días de desarrollo

#### 4. COTIZACIÓN → VIAJE
**Descripción:** Convertir una cotización aprobada en un viaje

**Funcionalidades:**
- Botón "Convertir a Viaje" en cotización
- Copiar todos los segmentos al viaje
- Asignar viajero(s) al viaje
- Poder editar después de convertir
- Vincular cotización con viaje creado

**Estimación:** 2 días de desarrollo

#### 5. GENERACIÓN DE PDFs
**Descripción:** Exportar cotizaciones a PDF con formato personalizable

**Funcionalidades:**
- Template de PDF con logo
- Información del viajero
- Lista de segmentos ordenados
- Totales y observaciones
- Formato editable (posiciones, negritas, colores)
- Descargar o enviar por email

**Librerías sugeridas:**
- jsPDF o pdfmake
- html2pdf.js

**Estimación:** 3-4 días de desarrollo

#### 6. INTEGRACIÓN COMPLETA CON SUPABASE
**Descripción:** Conectar todas las vistas con la base de datos

**Tablas necesarias:**

```sql
-- Viajeroz
viajeroz (
  id, nombre, apellido, email, telefono,
  identidad, pais_residencia, fecha_nacimiento,
  numero_pasaporte, fecha_venc_pasaporte,
  numero_visa, pais_visa, tipo_visa, fecha_venc_visa,
  created_at, updated_at
)

-- Viajes
viajes (
  id, nombre, descripcion, fecha_inicio, fecha_fin,
  estado (por_iniciar | en_curso | finalizado),
  progreso_porcentaje, segmento_actual_id,
  cotizacion_id (nullable),
  created_at, updated_at
)

-- Relación Viaje-Viajero (muchos a muchos)
viaje_viajeroz (
  id, viaje_id, viajero_id,
  created_at
)

-- Cotizaciones
cotizaciones (
  id, viajero_id (nullable), nombre,
  estado (borrador | enviada | aprobada | rechazada),
  created_at, updated_at
)

-- Segmentos
segmentos (
  id, tipo (transporte | hospedaje | actividad),
  nombre, proveedor,
  fecha_inicio, fecha_fin,
  hora_inicio, hora_fin,
  duracion, observaciones,
  cotizacion_id (nullable),
  viaje_id (nullable),
  orden, created_at, updated_at
)

-- Segmento Transporte (extiende segmentos)
segmentos_transporte (
  segmento_id, tipo_transporte,
  tiene_retorno
)

-- Segmento Hospedaje (extiende segmentos)
segmentos_hospedaje (
  segmento_id, tipo_hospedaje
)

-- Segmento Actividad (extiende segmentos)
segmentos_actividad (
  segmento_id, duracion_horas
)

-- Archivos/Documentos
documentos (
  id, segmento_id, nombre_archivo,
  ruta_storage, tipo_archivo, tamano,
  created_at
)
```

**Políticas RLS:**
- Admins: acceso total
- Viajeroz: solo ver sus datos

**Estimación:** 4-5 días de desarrollo

---

### PRIORIDAD ALTA 🟠

#### 7. SISTEMA DE CORREOS
**Descripción:** Envío manual de notificaciones

**Funcionalidades:**
- Botón "Enviar Notificación" en cada segmento
- Template de correo con detalles del segmento
- Envío mediante servicio (Resend, SendGrid, etc.)
- Log de correos enviados
- Correos desde dominio corporativo

**Estimación:** 2-3 días de desarrollo

#### 8. DASHBOARD CON DATOS REALES
**Descripción:** Completar widgets del dashboard

**Funcionalidades:**
- Viajes en curso con datos de Supabase
- Cálculo automático de progreso
- Pasaportes/visas próximos a vencer (30, 60, 90 días)
- Cumpleaños del mes
- Estadísticas generales
- Gráficos visuales

**Estimación:** 2 días de desarrollo

#### 9. MEJORAS EN FORMULARIOS
**Descripción:** Validaciones y experiencia de usuario

**Mejoras:**
- Validación de fechas (fin no puede ser antes de inicio)
- Autocompletado de proveedores frecuentes
- Guardado como borrador
- Mensajes de éxito/error
- Loading states
- Confirmaciones antes de eliminar

**Estimación:** 2 días de desarrollo

---

### PRIORIDAD MEDIA 🟡

#### 10. BÚSQUEDAS Y FILTROS AVANZADOS
- Filtros por fecha en todas las tablas
- Búsqueda por múltiples campos
- Exportar tablas a Excel
- Paginación

**Estimación:** 1-2 días

#### 11. CONFIGURACIÓN DEL SISTEMA
- Logo editable
- Colores personalizables
- Formatos de fecha/hora
- Moneda
- Idioma

**Estimación:** 1-2 días

#### 12. REPORTES Y ESTADÍSTICAS
- Reporte de viajes por mes
- Reporte de ingresos
- Viajeros más frecuentes
- Destinos populares

**Estimación:** 2-3 días

---

## 🗓️ PLAN DE IMPLEMENTACIÓN SUGERIDO

### FASE 1: COMPLETAR BASE DE DATOS (1 semana)
1. Diseñar esquema completo en Supabase
2. Crear todas las tablas
3. Configurar RLS policies
4. Crear Storage buckets para documentos
5. Seeds de datos de prueba

### FASE 2: COMPLETAR MÓDULO DE COTIZACIONES (1.5 semanas)
1. Sistema de múltiples segmentos
2. Conectar con Supabase
3. Generación de PDFs
4. Asignación a viajero

### FASE 3: MEJORAR MÓDULO DE VIAJES (1 semana)
1. Crear viaje desde cotización
2. Sistema de segmentos en viajes
3. Subida de archivos por segmento
4. Cálculo de progreso

### FASE 4: COMPLETAR PORTAL DEL VIAJERO (3-4 días)
1. Login con dos parámetros de seguridad
2. Sistema de descarga de archivos por segmento
3. Conectar con Supabase
4. Filtrar viajes por usuario

### FASE 5: DASHBOARD Y CORREOS (1 semana)
1. Completar widgets con datos reales
2. Sistema de correos
3. Notificaciones

### FASE 6: PULIDO Y TESTING (1 semana)
1. Validaciones
2. Mensajes de error
3. Loading states
4. Testing general
5. Corrección de bugs

**TIEMPO TOTAL ESTIMADO: 5.5-6 semanas (~1.5 meses)**

> **Nota:** El Portal del Viajero ya tiene una base sólida (70%) lo que reduce ~3 días del tiempo original estimado.

---

## 📝 NOTAS IMPORTANTES DE LA CONVERSACIÓN

### Decisiones de Diseño:
1. **Color corporativo:** Naranja (ya implementado)
2. **Nombre de clientes:** "Viajeroz" (ya implementado)
3. **Fecha final opcional:** Los segmentos pueden ser solo de ida
4. **Observaciones en todo:** Cada segmento debe tener campo de observaciones
5. **Archivos críticos:** Los viajeroz deben poder ver documentos adjuntos

### Flujos Clave:
1. **Cotización → Viaje:** Principal forma de crear viajes
2. **Viaje Manual:** También se pueden crear desde cero
3. **Login Viajero:** Dos parámetros obligatorios para seguridad
4. **Correos Manuales:** El admin decide cuándo notificar, no es automático

### Integraciones Pendientes:
- Dominio: viajemoz / viajeroz
- Hosting web con link al sistema
- Correos corporativos
- Otro sistema de minislador (mencionado pero no relacionado)

---

## 🎨 ASPECTOS VISUALES

### Ya Implementado:
- ✅ Sidebar flotante con hover
- ✅ Colores naranja corporativos
- ✅ Íconos de Lucide
- ✅ Cards con hover effects
- ✅ Modals responsivos
- ✅ DataTables personalizadas

### Pendiente:
- Logo de la empresa
- Template de PDF personalizable
- Favicon
- Imágenes de marca

---

## 💻 STACK TECNOLÓGICO ACTUAL

**Frontend:**
- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS
- Lucide Icons
- Vue Router

**Backend/Database:**
- Supabase (PostgreSQL)
- Supabase Storage (para archivos)
- Supabase Auth (para autenticación)

**Pendiente de definir:**
- Librería de PDFs (jsPDF / pdfmake)
- Servicio de correos (Resend / SendGrid)

---

## 🐛 BUGS Y MEJORAS VISUALES

### Bugs Conocidos:
- ViajeForm tiene colores emerald en lugar de orange (parcialmente corregido)
- No hay validación de fechas
- Duración puede dar resultados negativos si fecha_fin < fecha_inicio

### Mejoras UX Pendientes:
- Loading skeletons
- Toasts en lugar de alerts
- Animaciones de transición
- Estados vacíos más atractivos
- Drag & drop para archivos

---

## 📊 MÉTRICAS DE PROGRESO GENERAL

```
MÓDULO              PROGRESO    PRIORIDAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sidebar             ████████████ 100%    Completo ✅
Viajeroz            ████████░░░░  80%    Alta 🟠
Viajes              ███████░░░░░  60%    Crítica 🔴
Cotizaciones        ████████░░░░  70%    Crítica 🔴
Dashboard           ████░░░░░░░░  40%    Alta 🟠
Portal Viajero      ████████░░░░  70%    Crítica 🔴
Base de Datos       ░░░░░░░░░░░░   0%    Crítica 🔴
Sistema Archivos    ░░░░░░░░░░░░   0%    Crítica 🔴
PDFs                ░░░░░░░░░░░░   0%    Crítica 🔴
Correos             ░░░░░░░░░░░░   0%    Alta 🟠
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL GENERAL       █████░░░░░░░  45%
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Revisar y aprobar** este análisis con el cliente
2. **Decidir prioridades** según necesidad del negocio
3. **Diseñar esquema de base de datos** completo
4. **Crear mockups** del Portal del Viajero (si es necesario)
5. **Iniciar desarrollo** según el plan de fases

---

**Documento creado por:** Asistente IA  
**Última actualización:** 13 de Octubre, 2025  
**Versión:** 1.0

