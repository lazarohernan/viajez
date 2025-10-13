## Esquema de Tablas (Propuesta) - Sistema Administrativo

Nota: Este documento enumera las tablas y campos a crear. No incluye SQL. Los nombres están en snake_case para consistencia. Se indican claves y relaciones de forma descriptiva.

---

### 1) clientes

- id (PK)
- nombre
- apellido
- email
- telefono
- direccion
- numero_pasaporte
- fecha_emision_pasaporte (date)
- fecha_vencimiento_pasaporte (date)
- fecha_emision_visa (date, opcional)
- fecha_vencimiento_visa (date, opcional)
- identidad (opc.)
- fecha_nacimiento (date)
- sexo (M/F/O)
- pais_residencia
- pais_nacimiento
- created_at
- updated_at

---

### 2) viajes

- id (PK)
- nombre_viaje
- fecha_inicio (date)
- fecha_fin (date)
- descripcion (opc.)
- created_at
- updated_at

---

### 3) participantes_viaje

Relación de personas (clientes) que forman parte de un viaje.

- id (PK)
- viaje_id (FK → viajes.id)
- cliente_id (FK → clientes.id)
- rol (opc., p.ej. "titular", "acompañante")
- notas (opc.)
- created_at
- updated_at

---

### 4) segmentos

Segmentos del viaje (primer selector: categoria) y tipo específico (segundo selector: tipo).

- id (PK)
- viaje_id (FK → viajes.id)
- categoria (enum: "transporte", "acomodacion", "actividades", "seguro")
- tipo (enum cuando aplique, p.ej. para transporte: "aereo", "renta_vehiculo", "uber", "transporte_privado", "tren", "barco", "moto")
- origen (departure_location) – opcional según categoria
- destino (arrival_location) – opcional según categoria
- fecha_inicio (date) – requerido en transporte/actividades/seguro
- hora_inicio (time) – requerido cuando aplique
- fecha_fin (date) – requerido cuando aplique
- hora_fin (time) – requerido cuando aplique
- comentarios (opc.)
- created_at
- updated_at

Observación: Los siguientes detalles se modelan en tablas específicas por tipo para mantener claridad.

---

### 4.1) segmento_transporte_aereo

Detalles exclusivos de transporte aéreo.

- id (PK)
- segmento_id (FK → segmentos.id)
- aerolinea
- codigo_reserva
- tiene_equipaje_facturado (boolean)
- maletas_mano (integer, opc.)
- maletas_carga (integer, opc.)
- asiento (opc.)
- created_at
- updated_at

---

### 4.2) segmento_renta_vehiculo

- id (PK)
- segmento_id (FK → segmentos.id)
- empresa_rentadora
- tipo_vehiculo
- seguros_incluidos (texto)
- codigo_reserva (opc.)
- created_at
- updated_at

---

### 4.3) segmento_transporte_generico

Para Uber, Transporte Privado, Tren, Barco, Moto (cuando no se requiera estructura propia).

- id (PK)
- segmento_id (FK → segmentos.id)
- empresa_transporte (opc.)
- codigo_reserva (opc.)
- created_at
- updated_at

---

### 4.4) segmento_acomodacion

- id (PK)
- segmento_id (FK → segmentos.id)
- nombre_hospedaje
- numero_habitaciones (integer)
- direccion
- beneficios (texto, opc.)
- check_in_fecha (date)
- check_in_hora (time)
- check_out_fecha (date)
- check_out_hora (time)
- created_at
- updated_at

---

### 4.5) segmento_actividad

- id (PK)
- segmento_id (FK → segmentos.id)
- nombre_actividad (opc.)
- fecha (date)
- hora (time)
- detalles (texto, opc.)
- created_at
- updated_at

---

### 4.6) segmento_seguro (opcional, según necesidad)

Si se requiere detallar póliza.

- id (PK)
- segmento_id (FK → segmentos.id)
- aseguradora (opc.)
- numero_poliza (opc.)
- cobertura (texto, opc.)
- telefono_asistencia (opc.)
- created_at
- updated_at

---

### 5) anexos

Repositorio de archivos (p. ej., cotización, itinerario, otros). Se pueden asociar al viaje o a un segmento específico.

- id (PK)
- viaje_id (FK → viajes.id, opc.)
- segmento_id (FK → segmentos.id, opc.)
- tipo_anexo (enum: "cotizacion", "itinerario", "otro")
- nombre_archivo
- url_archivo (ruta de almacenamiento)
- formato_mime
- tamano_bytes (integer)
- fecha_subida (timestamp)
- notas (opc.)
- created_at
- updated_at

---

## Reglas/validaciones sugeridas

- segmentos.categoria = "transporte" ⇒ segmentos.tipo debe ser uno de: aereo, renta_vehiculo, uber, transporte_privado, tren, barco, moto.
- Para transporte: exigir fecha_inicio, hora_inicio; y origen/destino.
- Para aereo: exigir aerolinea y codigo_reserva; permitir maletas y asiento.
- Para renta_vehiculo: exigir empresa_rentadora y tipo_vehiculo; registrar seguros_incluidos.
- Para acomodacion: exigir check_in y check_out (fecha y hora) y nombre_hospedaje.
- Para actividades: exigir fecha y hora, y permitir detalles.
- anexos: permitir asociar a viaje o a segmento (uno, ambos, o al menos uno).

---

## Notas

- Este diseño prioriza claridad para el sistema administrativo y facilita reportes.
- Los campos "created_at" y "updated_at" pueden gestionarse automáticamente (por ejemplo, con triggers de la base de datos o configuraciones de Supabase).
- La tabla segmento_transporte_generico cubre Uber, Privado, Tren, Barco y Moto cuando no se requieran campos específicos.
