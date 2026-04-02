Reportes

Dashboard de reportes (solo admin): GET /api/reportes/dashboard/


Parametros query soportados

periodo: dia | semana | mes

anio: entero entre 1 y 9999

mes: entero entre 1 y 12

umbral_stock: entero >= 0 (por defecto 15)

top_limit: entero >= 1 (por defecto 5)

alertas_limit: entero >= 1 (por defecto 5)


Ejemplos

Reporte diario: GET /api/reportes/dashboard/?periodo=dia&anio=2026&mes=4

Reporte semanal: GET /api/reportes/dashboard/?periodo=semana&anio=2026&mes=4

Reporte mensual: GET /api/reportes/dashboard/?periodo=mes&anio=2026&mes=4

Con limites personalizados: GET /api/reportes/dashboard/?periodo=dia&anio=2026&mes=4&top_limit=10&alertas_limit=10&umbral_stock=8


Validaciones y codigos de respuesta

200 OK: parametros validos y usuario admin autenticado.

400 Bad Request: periodo, anio o mes invalidos.

403 Forbidden: usuario autenticado sin permisos de administrador.

401 Unauthorized: sin token o token invalido.


Mensajes de validacion (400)

Periodo invalido:
{"detalle": "Parametro periodo invalido. Use: dia, semana o mes."}

Mes invalido no numerico:
{"detalle": "Parametro mes invalido. Debe ser un numero entre 1 y 12."}

Mes fuera de rango:
{"detalle": "Parametro mes invalido. Debe estar entre 1 y 12."}

Anio invalido no numerico:
{"detalle": "Parametro anio invalido. Debe ser un numero entero entre 1 y 9999."}

Anio fuera de rango:
{"detalle": "Parametro anio invalido. Debe estar entre 1 y 9999."}


Estructura base de respuesta (200)

```json
{
  "resumen": {
    "ventas_mes": 0.0,
    "pedidos_dia": 0,
    "pedidos_por_estado": [],
    "anio": 2026,
    "mes": 4
  },
  "distribucion_marcas": [],
  "ingresos": {
    "periodo": "dia",
    "etiquetas": [],
    "valores": []
  },
  "top_sellers": [],
  "alertas": []
}
```

Nota

`pedidos_por_estado` usa los estados reales de la base de datos (por ejemplo: recibido, preparando, en camino, entregado, cancelado).