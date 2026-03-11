# VanelisCream - Sistema de Pedidos para Heladería

Sistema web para gestión de pedidos de una heladería multimarca.

## Requisitos

- Python 3.13.11
- PostgreSQL 16.4

## Instalación

### 1. Clonar repositorio
```bash
git clone <url-del-repositorio>
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
pip install requirements.txt
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
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 6. Ejecutar servidor
```bash
python manage.py runserver
```

Servidor disponible en: http://localhost:8000
