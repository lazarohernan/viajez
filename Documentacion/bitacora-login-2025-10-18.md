# Bitácora de incidente: Login administrador

## Resumen
El acceso con `servicioalcliente@viajemoz.com` fallaba con el error `permission denied for table user_roles`. Aunque la autenticación con `supabase.auth.signInWithPassword()` era exitosa, la consulta posterior para obtener el rol (`user_roles`) era bloqueada por RLS.

## Línea de tiempo
- **2025-10-18 21:00** · Se detecta error `42501` en `user_roles` durante el login del panel admin.
- **21:05** · Se elimina el usuario previo `admin@viajemoz.com` y registros asociados (`admins`, `user_roles`).
- **21:10** · Se crea usuario `servicioalcliente@viajemoz.com` con password `Secure123#@Jo`, se genera perfil en `admins` y se asigna rol `admin`.
- **21:20** · Se recrea el hook `public.custom_access_token_hook` con `security definer` y `search_path` seguro (`public, auth`).
- **21:30** · Se ajustan políticas RLS de `user_roles` permitiendo lectura completa a `authenticated`, `anon` y `supabase_auth_admin`.
- **21:32** · Se detecta que faltaban permisos `GRANT SELECT` a nivel de tabla para `authenticated` y `anon`; se otorgan.
- **21:34** · Pruebas con `curl` confirman:
  - Login correcto (token emitido con `user_role":"admin"`).
  - Lectura de `user_roles` y `admins` con el token del usuario autenticado.

## Cambios aplicados
- **Hook JWT**: `custom_access_token_hook` redefine claims, agrega `user_role` y corre bajo `SECURITY DEFINER`.
- **Políticas RLS** (`user_roles`):
  - `authenticated_can_read_all_roles` → SELECT para `authenticated`.
  - `anon_read_for_login` → SELECT para `anon`.
  - `auth_admin_read_all_roles` → SELECT para `supabase_auth_admin`.
- **Permisos tabla `user_roles`**:
  ```sql
  GRANT SELECT ON public.user_roles TO authenticated;
  GRANT SELECT ON public.user_roles TO anon;
  ```
- **Scripts ejecutados**:
  - `crear-admin-nuevo.js` (Node, ES module) para crear el administrador con service role.
  - Pruebas `curl` para login y consultas REST (`/auth/v1/token`, `/rest/v1/user_roles`, `/rest/v1/admins`).

## Estado final
- Usuario `servicioalcliente@viajemoz.com` activo, confirmado y con rol `admin`.
- Login web y vía REST funcionando (sin errores 403/42501).
- Hook JWT y RLS alineados con la arquitectura del frontend.

## Recomendaciones
- Asegurar que los scripts con `service_role` se ejecuten solo localmente (no dejar claves en `.env`).
- Mantener esta bitácora actualizada si se realizan cambios adicionales en RLS o hooks.
- Al agregar nuevos roles, ajustar tanto el hook como las políticas correspondientes.
