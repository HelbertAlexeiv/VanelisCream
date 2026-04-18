from rest_framework import viewsets
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Marca, Presentacion, Producto
from .serializers import MarcaSerializer, PresentacionSerializer, ProductoSerializer
from django.db.models import Q


# Las vistas son las encargadas de manejar las solicitudes HTTP y devolver las respuestas adecuadas.
# En este caso, estamos utilizando viewsets de Django REST Framework
# para crear vistas que manejann las operaciones CRUD (Create, Read, Update, Delete) para cada uno de los modelos.


class ProductoPagination(PageNumberPagination):
    # Configuramos la paginación para los productos, estableciendo un tamaño de página predeterminado de 10
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100 


#filtros para productos
class ProductoFilter(filters.FilterSet):
    precio_min = filters.NumberFilter(field_name="precio", lookup_expr="gte")
    precio_max = filters.NumberFilter(field_name="precio", lookup_expr="lte")
    q = filters.CharFilter(method="filtrar_busqueda")

    class Meta:
        model = Producto
        fields = ["marca", "presentacion", "precio_min", "precio_max", "q"]

    def filtrar_busqueda(self, queryset, name, value):
        return queryset.filter(
            Q(nombre__icontains=value) |
            Q(descripcion__icontains=value))


#Aqui maneja el CRUD 
class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all() #Queryn para hacer el CRUD, esto gracias a que es un ModelViewSet
    serializer_class = MarcaSerializer #Convierte los objetos Marca a formatos como JSON para enviarlos a través de la API.
    # permission_classes = [IsAuthenticated]

class PresentacionViewSet(viewsets.ModelViewSet):
    queryset = Presentacion.objects.all()
    serializer_class = PresentacionSerializer
    # permission_classes = [IsAuthenticated]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('marca', 'presentacion').filter(stock__gt=0).order_by('nombre')
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend] 
    filterset_class = ProductoFilter
    pagination_class = ProductoPagination
    # permission_classes = [IsAuthenticated]

    # endpoint para ver los que tienen poco stock (<= 10)
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='stock_bajo',
        url_name='stock-bajo',
    )
    # Este método maneja una solicitud GET a la URL /api/catalogo/productos/stock_bajo/ 
    # y devuelve una lista de productos cuyo stock es menor o igual a un umbral especificado (por defecto 15).
    def stock_bajo(self, request):
        umbral = request.query_params.get('umbral', 15)
        try:
            umbral = int(umbral)
        except ValueError:
            umbral = 10
            
        productos_bajo_stock = Producto.objects.select_related('marca', 'presentacion').filter(stock__lte=umbral).order_by('nombre')
        serializer = self.get_serializer(productos_bajo_stock, many=True)
        return Response({
            "descripcion": f"Productos con stock menor o igual a {umbral}",
            "resultados": serializer.data
        })
