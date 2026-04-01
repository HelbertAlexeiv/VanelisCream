from rest_framework import viewsets
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Marca, Presentacion, Producto
from .serializers import MarcaSerializer, PresentacionSerializer, ProductoSerializer

#filtros para productos
class ProductoFilter(filters.FilterSet):
    precio_min = filters.NumberFilter(field_name="precio", lookup_expr="gte")
    precio_max = filters.NumberFilter(field_name="precio", lookup_expr="lte")
    q = filters.CharFilter(method="filtrar_busqueda")

    class Meta:
        model = Producto
        fields = ["marca", "presentacion", "precio_min", "precio_max", "q"]

    def filtrar_busqueda(self, queryset, name, value):
        return queryset.filter(nombre__icontains=value) | queryset.filter(descripcion__icontains=value)

#falta PAG
class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    # permission_classes = [IsAuthenticated]

class PresentacionViewSet(viewsets.ModelViewSet):
    queryset = Presentacion.objects.all()
    serializer_class = PresentacionSerializer
    # permission_classes = [IsAuthenticated]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('marca', 'presentacion')
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductoFilter
    # permission_classes = [IsAuthenticated]

    # endpoint para ver los que tienen poco stock (<= 10)
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='stock_bajo',
        url_name='stock-bajo',
    )
    def stock_bajo(self, request):
        umbral = request.query_params.get('umbral', 15)
        try:
            umbral = int(umbral)
        except ValueError:
            umbral = 10
            
        productos_bajo_stock = Producto.objects.select_related('marca', 'presentacion').filter(stock__lte=umbral)
        serializer = self.get_serializer(productos_bajo_stock, many=True)
        return Response({
            "descripcion": f"Productos con stock menor o igual a {umbral}",
            "resultados": serializer.data
        })

    # endpoint para notificacion inicial de productos con stock bajo
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='alerta_stock_bajo',
        url_name='alerta-stock-bajo',
    )
    def alerta_stock_bajo(self, request):
        umbral = request.query_params.get('umbral', 15)
        try:
            umbral = int(umbral)
        except ValueError:
            umbral = 10

        productos_bajo_stock = Producto.objects.select_related('marca', 'presentacion').filter(stock__lte=umbral)
        serializer = self.get_serializer(productos_bajo_stock, many=True)

        return Response({
            "hay_alertas": productos_bajo_stock.exists(),
            "total_productos_bajo_stock": productos_bajo_stock.count(),
            "umbral": umbral,
            "productos": serializer.data,
        })
