# VanelisCream - Sistema de Pedidos para Heladería

Sistema web para gestión de pedidos de una heladería multimarca.

## Requisitos

- Python 3.13.11
- PostgreSQL 16.4

## Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/HelbertAlexeiv/VanelisCream.git
cd VanelisCream
```

### 2. Entorno virtual
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

### 3. Instalar dependencias
```bash
cd backend
pip install -r requirements.txt
```

### 4. Base de datos PostgreSQL

Crear base de datos:
```sql
psql -U <nombre_usuario>
CREATE DATABASE vaneliscream;
\q
```

Actualizar contraseña en `.env`:
```
DB_PASSWORD=tu_contraseña_real
```

### 5. Migraciones
```bash
python manage.py migrate
python manage.py createsuperuser
```
> Nota: Solo se ejecuta "makemigrations" cuando por ejemplo se alteran los atributos de las tablas, y se usa "migrate" cuando por ejemplo hacen un pull
> por primera vez

### 6. Cargar datos iniciales del catalogo

Despues de migrar la base de datos, cargar los datos semilla con el fixture versionado:

```bash
python manage.py loaddata fixtures/catalogo_datos.json
```

Opcional (respaldo): ejecutar el script SQL idempotente:

```bash
psql -U <nombre_usuario> -h localhost -d vaneliscream -f fixtures/seed_catalogo.sql
```

### 7. Ejecutar servidor
```bash
python manage.py runserver
```

Servidor disponible en: http://localhost:8000

## Autenticacion

Endpoints de autenticacion:

- POST /api/auth/registro/
- POST /api/auth/login/
- GET /api/auth/me/

Body JSON para login:
- Body JSON:

```json
{
	"username": "tu_usuario",
	"password": "tu_password"
}
```

Por defecto estan las siguientes credenciales

```json
{
	"username": "admin",
	"password": "contraseña administrador"
}
```

```json
{
	"username": "cliente",
	"password": "contraseña cliente"
}
```

Respuesta exitosa:

```json
{
	"token": "<token>"
}
```

Para endpoints protegidos, enviar el token en el header:

Authorization: Token <token>
