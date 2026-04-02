Pedidos

Listar todos los pedidos: GET /api/pedidos/

Crear un pedido: POST /api/pedidos/

Obtener un pedido específico: GET /api/pedidos/\<id\>/

Actualizar un pedido completo: PUT /api/pedidos/\<id\>/

Actualizar parcialmente un pedido: PATCH /api/pedidos/\<id\>/

Eliminar un pedido: DELETE /api/pedidos/\<id\>

Confirmar un pedido: POST /api/pedidos/\<id\>/confirmar/

Cancelar un pedido: POST /api/pedidos/\<id\>/cancelar/



Estados de pedido

Listar todos los estados: GET /api/pedidos/estado/

Obtener un estado específico: GET /api/pedidos/estado/<id>/



Body para crear un pedido

El campo `cliente_id` se asigna automaticamente desde el usuario autenticado, por lo que no se envia en el body.

```json
{
  "direccion_entrega": "Calle 123 #45-67",
  "total_pedido": 25000,
  "detalles": [
    {
      "producto": 64,
      "cantidad": 2,
      "precio_unitario": 8000,
      "subtotal": 16000
    },
    {
      "producto": 65,
      "cantidad": 1,
      "precio_unitario": 9000,
      "subtotal": 9000
    }
  ]
}
```

Body para confirmar un pedido

No requiere body.

```json
{}
```

Body para cancelar un pedido

No requiere body.

```json
{}
```



Paginación

Listar pedidos con paginación por defecto (10): GET /api/pedidos/

Ir a una página específica: GET /api/pedidos/?page=2

Cambiar tamaño de página: GET /api/pedidos/?page=1&page_size=20

Límite máximo de page_size: 100



Filtros

Filtrar por estado (id): GET /api/pedidos/?estado=1

Filtrar por nombre de estado exacto: GET /api/pedidos/?estado__nombre=recibido

Filtrar por nombre de estado parcial: GET /api/pedidos/?estado__nombre__icontains=rec

Filtrar por cliente (id): GET /api/pedidos/?cliente=5

Filtrar por empleado (id): GET /api/pedidos/?empleado=3

Filtrar pedidos sin empleado asignado: GET /api/pedidos/?empleado__isnull=true

Filtrar por fecha_creacion mayor o igual: GET /api/pedidos/?fecha_creacion__gte=2026-04-01T00:00:00Z

Filtrar por fecha_creacion menor o igual: GET /api/pedidos/?fecha_creacion__lte=2026-04-30T23:59:59Z

Filtrar por fecha_limite_cancelacion nula: GET /api/pedidos/?fecha_limite_cancelacion__isnull=true

Filtrar por total exacto: GET /api/pedidos/?total_pedido=25000

Filtrar por total mínimo: GET /api/pedidos/?total_pedido__gte=10000

Filtrar por total máximo: GET /api/pedidos/?total_pedido__lte=50000



Búsqueda

Buscar por dirección de entrega: GET /api/pedidos/?search=calle

Buscar por nombre de estado: GET /api/pedidos/?search=recibido

Buscar por username de cliente: GET /api/pedidos/?search=juan

Buscar por username de empleado: GET /api/pedidos/?search=maria



Ordenamiento

Ordenar por id ascendente: GET /api/pedidos/?ordering=id

Ordenar por id descendente: GET /api/pedidos/?ordering=-id

Ordenar por fecha_creacion ascendente: GET /api/pedidos/?ordering=fecha_creacion

Ordenar por fecha_creacion descendente: GET /api/pedidos/?ordering=-fecha_creacion

Ordenar por total_pedido ascendente: GET /api/pedidos/?ordering=total_pedido

Ordenar por total_pedido descendente: GET /api/pedidos/?ordering=-total_pedido



Ejemplo combinado

Filtrar por estado recibido, buscar "calle", ordenar por total descendente y paginar:

GET /api/pedidos/?estado__nombre=recibido&search=calle&ordering=-total_pedido&page=1&page_size=10



Notas

Todos los endpoints requieren autenticacion.

En la respuesta de un pedido se incluyen `estado`, `cliente`, `empleado` y `detalles` ya resueltos.
