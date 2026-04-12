# Guía de Despliegue en Render

## ✅ Estado Actual: LISTO PARA DESPLEGAR

Tu backend está completamente configurado para Render. Ahora solo debes agregar las variables de entorno en el panel.

---

## 📋 Variables a Agregar en Render

Ve a tu servicio Backend en Render → **Settings** → **Environment Variables** y agrega:

```
DEBUG=False
SECRET_KEY=<tu-secret-key>
ALLOWED_HOSTS=tu-backend-name.onrender.com
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://tu-frontend.vercel.app
```

### Base de datos Neon (recomendado con URL completa):
```
DATABASE_URL=postgresql://neondb_owner:<password>@ep-bitter-moon-amdalava.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Alternativa con variables individuales:
```
DB_HOST=ep-bitter-moon-amdalava.c-5.us-east-1.aws.neon.tech
DB_USER=neondb_owner
DB_PASSWORD=<password>
DB_NAME=neondb
DB_PORT=5432
```

---

## 🔧 Cambios Aplicados

✅ **ALLOWED_HOSTS** - Lee `ALLOWED_HOSTS` y también `RENDER_EXTERNAL_HOSTNAME` automáticamente  
✅ **DATABASES** - Soporta `DATABASE_URL` (Render/Neon) y variables individuales (local) con SSL en producción  
✅ **CORS** - Lee desde `CORS_ALLOWED_ORIGINS` (se actualiza después en Render)  
✅ **CSRF** - Lee desde `CSRF_TRUSTED_ORIGINS` para formularios y sesiones seguras  
✅ **requirements.txt** - Agregado `dj-database-url` para parsear DATABASE_URL  
✅ **Seguridad producción** - Cookies seguras + configuración HTTPS detrás de proxy  

---

## 🔄 Actualizar Después del Despliegue

### Cuando frontend esté listo:
En Render → Environment Variables → Donde dice `CORS_ALLOWED_ORIGINS`:
```
https://tu-frontend.vercel.app,https://tu-frontend.netlify.app
```
Se redeploya automáticamente en ≈1 min.

### Cuando BD esté lista:
Actualiza `DATABASE_URL` con la URL de Neon incluyendo `?sslmode=require`.

---

## 💾 Persistencia de Datos

✅ **Las contraseñas SÍ PERSISTEN:**
- Variables de entorno guardadas en Render (encriptadas)
- Base de datos en servicio PostgreSQL de Render
- Automáticamente disponibles en cada despliegue

✅ **No necesitas `.env` en Render:**
- Todo se configura en el panel de Render
- El `.env` local es solo para desarrollo

---

## 🚀 Chequeo Rápido

Después de desplegar, verifica:
1. **Backend responde:** `https://tu-backend-name.onrender.com/`
2. **Endpoints funcionan:** `https://tu-backend-name.onrender.com/api/usuarios/`
3. **CORS permitido:** Frontend puede hacer requests

Si falla: Revisa logs en Render → Deployments
