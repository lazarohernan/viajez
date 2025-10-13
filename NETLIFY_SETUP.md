# Configuración de Netlify - IMPORTANTE

## Repositorio actualizado

**Nuevo repositorio:** https://github.com/lazarohernan/viajez.git

## Problema identificado

El error 404 en Netlify se debe a que la configuración del sitio en Netlify tiene `yarn run build` como comando de build, pero este proyecto usa **npm**, no yarn.

## ✅ PASOS OBLIGATORIOS en Netlify

1. **Accede a tu sitio en Netlify**
   - Ve a https://app.netlify.com/

2. **Edita la configuración de Build**
   - Click en tu sitio
   - Ve a **Site configuration** → **Build & deploy** → **Continuous Deployment**
   - Click en **"Edit settings"**

3. **Cambia estas configuraciones:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```
   ⚠️ **IMPORTANTE**: Cambia `yarn run build` a `npm run build`

4. **Guarda los cambios**

5. **Haz un nuevo deploy**
   - Ve a **Deploys** → Click en **"Trigger deploy"** → **"Deploy site"**

## Configuración del archivo netlify.toml

El archivo `netlify.toml` en la raíz del proyecto ya tiene la configuración correcta:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Verificación

Después de cambiar la configuración y hacer un nuevo deploy:

1. Ve a **Deploys** en Netlify
2. Click en el último deploy
3. Verifica que el **Build log** muestre:
   - ✅ `npm run build` ejecutándose (NO yarn)
   - ✅ Build exitoso
   - ✅ Archivos publicados en `dist/`

## ¿Por qué este problema?

- Tu proyecto usa **npm** (tiene `package-lock.json`)
- Netlify estaba configurado para usar **yarn**
- Esto causa conflictos y el build puede fallar silenciosamente o generar archivos incorrectos

## Si el problema persiste

1. Verifica que el build log no tenga errores
2. Descarga los archivos del deploy desde Netlify y verifica que `index.html` exista
3. Revisa que la carpeta `dist/` contenga todos los archivos necesarios
