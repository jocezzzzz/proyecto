# TaskFlow ✅

![TaskFlow Demo](URL_DE_TU_CAPTURA)

Aplicación web de gestión de tareas con sincronización en tiempo real, desarrollada como proyecto universitario.

## 🚀 Demo
[https://taskflow.vercel.app](URL_DE_TU_DEPLOY)

## ✨ Características

### Autenticación
- Registro e inicio de sesión con email/contraseña
- Login con Google
- Protección de rutas (solo usuarios autenticados)

### Gestión de Tareas
- ✅ Crear tareas con título y descripción
- ✅ Editar tareas existentes
- ✅ Eliminar tareas
- ✅ Marcar como completadas/pendientes
- ✅ Filtros por estado (todas, pendientes, completadas)
- ✅ Búsqueda en tiempo real

### Extras implementados
- 📊 Dashboard con estadísticas de productividad
- 🔥 Sistema de rachas (streak)
- 🌓 Modo oscuro/claro automático
- ⚡ Sincronización en tiempo real
- 📱 Diseño 100% responsive

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Estilos**: Tailwind CSS + Heroicons
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Autenticación**: Supabase Auth (Email + Google OAuth)
- **Hosting**: Vercel
- **Versionado**: Git + GitHub

## 📸 Capturas de Pantalla

### Desktop
![Desktop](URL_CAPTURA_DESKTOP)

### Mobile
![Mobile](URL_CAPTURA_MOBILE)

### Dashboard
![Dashboard](URL_CAPTURA_DASHBOARD)

## 🗄️ Estructura de la Base de Datos

```sql
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);