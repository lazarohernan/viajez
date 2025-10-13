# ViajeMoz App

Sistema administrativo completo para gestión de viajes y clientes, desarrollado con Vue.js 3, TypeScript y Supabase.

## 🚀 Características

- **Página Pública**: Consulta de itinerarios por DNI
- **Panel Administrativo**: Gestión completa de clientes y viajes
- **Diseño Responsivo**: Interfaz moderna y adaptativa
- **Autenticación**: Sistema de login seguro
- **Base de Datos**: Integración con Supabase para persistencia de datos

## 🛠️ Tecnologías

- **Frontend**: Vue.js 3 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite
- **Router**: Vue Router 4
- **State Management**: Pinia (preparado)

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de interfaz
│   └── icons/          # Iconos SVG
├── views/              # Páginas principales
├── router/             # Configuración de rutas
├── stores/             # Estado global (Pinia)
└── assets/             # Estilos y recursos
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/lazarohernan/viajemoz-app.git

# Entrar al directorio
cd viajemoz-app

# Instalar dependencias
npm install
```

### Desarrollo
```bash
# Servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Linting
npm run lint
```

## 🌐 Páginas Principales

- **Home** (`/`): Consulta pública de viajes por DNI
- **Login** (`/login`): Acceso administrativo
- **Dashboard** (`/dashboard`): Panel principal administrativo
- **Clientes** (`/cliente`): Gestión de clientes
- **Viajes** (`/viajes`): Gestión de itinerarios

## 🎨 Paleta de Colores

- **Primario**: Naranja (#f97316, #ea580c)
- **Secundario**: Azul cielo (#0ea5e9)
- **Neutros**: Grises (#6b7280, #374151)

## 📊 Base de Datos

El proyecto incluye un esquema completo de tablas para:
- Clientes y documentos
- Viajes y fechas
- Segmentos (transporte, alojamiento, actividades)
- Anexos y archivos

Ver `docs/esquema_tablas.md` para más detalles.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador**: Lázaro Hernán
- **GitHub**: [@lazarohernan](https://github.com/lazarohernan)
- **Proyecto**: [ViajeMoz App](https://github.com/lazarohernan/viajemoz-app)

---

Desarrollado con ❤️ para ViajeMoz
