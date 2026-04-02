Autenticacion

Base: /api/auth/


Registro de usuario

Endpoint: POST /api/auth/registro/

Autenticacion: no requerida.

Body de entrada:

```json
{
  "username": "carla",
  "email": "carla@example.com",
  "password": "Segura1234!",
  "password2": "Segura1234!",
  "first_name": "Carla",
  "last_name": "Mora",
  "telefono": "3001234567",
  "direccion": "Calle 1",
  "rol": 1
}
```

Notas:

- rol es opcional.
- password y password2 deben coincidir.
- password pasa por validacion de contrasena de Django.

Respuesta exitosa (201):

```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "id": 10,
    "username": "carla",
    "email": "carla@example.com",
    "first_name": "Carla",
    "last_name": "Mora",
    "telefono": "3001234567",
    "direccion": "Calle 1",
    "rol": {
      "id": 1,
      "nombre": "cliente"
    }
  }
}
```

Errores comunes:

- 400 si faltan campos requeridos.
- 400 si password2 no coincide.
- 400 si password no cumple politicas.


Login

Endpoint: POST /api/auth/login/

Autenticacion: no requerida.

Body de entrada:

```json
{
  "username": "carla",
  "password": "Segura1234!"
}
```

Respuesta exitosa (200):

```json
{
  "token": "<TOKEN>"
}
```

Errores comunes:

- 400 si credenciales invalidas.

Nota:

- Este endpoint usa token auth de DRF.
- En requests protegidas, enviar header: Authorization: Token <TOKEN>


Usuario autenticado actual

Endpoint: GET /api/auth/me/

Autenticacion: requerida (Token).

Header:

Authorization: Token <TOKEN>

Respuesta exitosa (200):

```json
{
  "id": 10,
  "username": "carla",
  "email": "carla@example.com",
  "first_name": "Carla",
  "last_name": "Mora",
  "telefono": "3001234567",
  "direccion": "Calle 1",
  "rol": {
    "id": 1,
    "nombre": "cliente"
  }
}
```

Errores comunes:

- 401 si falta token o token invalido.


Resumen rapido de codigos

- POST /api/auth/registro/: 201, 400
- POST /api/auth/login/: 200, 400
- GET /api/auth/me/: 200, 401
