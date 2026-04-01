from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from .models import EstadoPedido, Pedido
from .serializers import PedidoCreateSerializer, PedidoSerializer


class PedidoPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related('estado', 'cliente', 'empleado',).prefetch_related('detalles')
    permission_classes = [IsAuthenticated]
    pagination_class = PedidoPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        'estado': ['exact'],
        'estado__nombre': ['exact', 'icontains'],
        'cliente': ['exact'],
        'empleado': ['exact', 'isnull'],
        'fecha_creacion': ['exact', 'gte', 'lte'],
        'fecha_limite_cancelacion': ['exact', 'gte', 'lte', 'isnull'],
        'total_pedido': ['exact', 'gte', 'lte'],
    }
    search_fields = [
        'direccion_entrega',
        'estado__nombre',
        'cliente__username',
        'empleado__username',
    ]
    ordering_fields = [
        'id',
        'fecha_creacion',
        'fecha_limite_cancelacion',
        'total_pedido',
    ]
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        if self.action == 'create':
            return PedidoCreateSerializer
        return PedidoSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(cliente=user)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        pedido = self.get_object()
    
        if pedido.estado.nombre.lower() != 'recibido':
            return Response(
                {
                    'detalle': 'Solo se pueden cancelar pedidos con estado recibido.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not pedido.fecha_limite_cancelacion:
            return Response(
                {
                    'detalle': 'El pedido no tiene fecha limite de cancelacion definida.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if timezone.now() >= pedido.fecha_limite_cancelacion:
            return Response(
                {
                    'detalle': 'El tiempo limite para cancelar el pedido ya expiro.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        estado_cancelado = EstadoPedido.objects.filter(nombre__iexact='cancelado').first()
        if not estado_cancelado:
            return Response(
                {
                    'detalle': 'No existe el estado cancelado configurado.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        pedido.estado = estado_cancelado
        pedido.save(update_fields=['estado'])

        return Response(
            {
                'detalle': 'Pedido cancelado correctamente.'
            },
            status=status.HTTP_200_OK,
        )