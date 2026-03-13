from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import F, Q 

from .models import Marca, Presentacion, Producto
from .serializers import MarcaSerializer, PresentacionSerializer, ProductoSerializer

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer

class PresentacionViewSet(viewsets.ModelViewSet):
    queryset = Presentacion.objects.all()
    serializer_class = PresentacionSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    # filtrar por marca, presentación y precio usando query params
    def get_queryset(self):
    
        marca_id = self.request.query_params.get('marca')
        presentacion_id = self.request.query_params.get('presentacion') 
        precio_min = self.request.query_params.get('precio_min')
        precio_max = self.request.query_params.get('precio_max')
        
        queryset = self.queryset.select_related('marca', 'presentacion')
        busqueda = self.request.query_params.get('q') # para búsqueda general en nombre o descripción
        
        if marca_id:
            queryset = queryset.filter(marca_id=marca_id)
        if presentacion_id:
            queryset = queryset.filter(presentacion_id=presentacion_id)
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)
        if busqueda:
            # Busca la palabra tanto en el nombre COMO en la descripción usando Q objects para hacer un "OR"
            queryset = queryset.filter(
                Q(nombre__icontains=busqueda) | Q(descripcion__icontains=busqueda)
            )
            
        return queryset

    # endpoint para ver los que tienen poco stock (<= 10)
    @action(detail=False, methods=['get'])
    def stock_bajo(self, request):
        umbral = request.query_params.get('umbral', 10)
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
