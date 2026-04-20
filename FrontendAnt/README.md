# Vanelis Cream Frontend

Frontend SPA construido con React + Vite.

## Scripts

- `npm run dev`: entorno local
- `npm run build`: build de producción
- `npm run preview`: previsualización del build
- `npm run lint`: validación con ESLint

## Variables de entorno

Crear un archivo `.env` local tomando como base `.env.example`.

Variable requerida:

- `VITE_API_URL`: URL base del backend (por ejemplo `https://api.tudominio.com`)

## Despliegue en Vercel

1. Importar este proyecto en Vercel.
2. Configurar Root Directory en `FrontendAnt` (si despliegas desde el monorepo).
3. Agregar variable de entorno `VITE_API_URL` en Project Settings > Environment Variables.
4. Usar comandos por defecto de Vite:
	- Build Command: `npm run build`
	- Output Directory: `dist`
5. Desplegar.

El archivo `vercel.json` ya incluye rewrite para SPA, permitiendo navegación directa en rutas como `/tienda` o `/admin/dashboard` sin errores 404.
