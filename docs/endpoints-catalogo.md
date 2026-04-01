NO requieren autentificacion:


MARCAS

Listar todas las marcas: GET /api/catalogo/marcas/

Crear una marca: POST /api/catalogo/marcas/

Obtener una marca específica: GET /api/catalogo/marcas/<id>/

Actualizar una marca: PUT /api/catalogo/marcas/<id>/

Eliminar una marca: DELETE /api/catalogo/marcas/<id>/




PRESENTACION

Listar todas las presentaciones: GET /api/catalogo/presentaciones/

Crear una presentación: POST /api/catalogo/presentaciones/

Obtener una presentación específica: GET /api/catalogo/presentaciones/<id>/

Actualizar una presentación: PUT /api/catalogo/presentaciones/<id>/

Eliminar una presentación: DELETE /api/catalogo/presentaciones/<id>/





PRODUCTOS

Listar todos los productos: GET /api/catalogo/productos/

Crear un producto: POST /api/catalogo/productos/

Obtener un producto específico: GET /api/catalogo/productos/<id>/

Actualizar un producto: PUT /api/catalogo/productos/<id>/

Eliminar un producto: DELETE /api/catalogo/productos/<id>/

Stock Bajo (Alerta): GET /api/catalogo/productos/stock_bajo/




FILTROS

Filtrar solo por marca (por ej. marca con id=2)
GET /api/catalogo/productos/?marca=2

Filtrar solo por presentación (por ej. presentación con id=1):
GET /api/catalogo/productos/?presentacion=1

Filtrar por ambas a la vez:
GET /api/catalogo/productos/?marca=2&presentacion=1


Si el usuario escribe "vainilla" en el buscador de la página., busca si coinicde en el nombre o descricpioc:

GET /api/catalogo/productos/?q=vainilla


Combinar filtros:


GET /api/catalogo/productos/?marca=1&q=chocolate


GET /api/catalogo/productos/?marca=4&presentacion=1&q=crema



ESTANDARIZADA-de todos los filtros posibles:

GET /api/catalogo/productos/?marca=<id>&presentacion=<id>&precio_min=<n>&precio_max=<n>&q=<texto>



Requiere autentificcacion:

TOKEN - especificamente para ver en el informe los productos con bajo stock

opcional le puedes poner el umbra, pero si no ya hay uno por defecto de 15
GET /api/catalogo/productos/stock_bajo/?umbral=10
