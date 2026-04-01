from django.db import transaction
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from inventario.services import InventarioService

from .models import EstadoPedido, Pedido
from .models import AuditoriaPedido
from .serializers import (
    AuditoriaPedidoSerializer,
    PedidoCreateSerializer,
    PedidoEstadoUpdateSerializer,
    PedidoSerializer,
)


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

    @staticmethod
    def _registrar_auditoria_estado(*, pedido, usuario, estado_anterior, estado_nuevo):
        AuditoriaPedido.objects.create(
            pedido=pedido,
            usuario=usuario.username,
            accion='ACTUALIZAR',
            campo_modificado='estado',
            valor_anterior=estado_anterior,
            valor_nuevo=estado_nuevo,
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return PedidoCreateSerializer
        return PedidoSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(cliente=user)

    @action(detail=True, methods=['patch'], url_path='estado')
    def actualizar_estado(self, request, pk=None):
        if not request.user.is_staff:
            return Response(
                {'detalle': 'Solo un administrador puede cambiar el estado del pedido.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        pedido = self.get_object()
        serializer = PedidoEstadoUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        estado_nuevo = serializer.validated_data['estado']
        estado_anterior = pedido.estado

        if estado_nuevo.id == estado_anterior.id:
            return Response(
                {'detalle': 'El pedido ya tiene ese estado.'},
                status=status.HTTP_200_OK,
            )

        with transaction.atomic():
            pedido.estado = estado_nuevo
            pedido.empleado = request.user
            pedido.save(update_fields=['estado', 'empleado'])
            self._registrar_auditoria_estado(
                pedido=pedido,
                usuario=request.user,
                estado_anterior=estado_anterior.nombre,
                estado_nuevo=estado_nuevo.nombre,
            )

        return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='auditoria')
    def auditoria(self, request):
        if not request.user.is_staff:
            return Response(
                {'detalle': 'Solo un administrador puede consultar la auditoria.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = AuditoriaPedido.objects.select_related('pedido')

        pedido_id = request.query_params.get('pedido_id')
        if pedido_id:
            queryset = queryset.filter(pedido_id=pedido_id)

        ordering_param = request.query_params.get('ordering', '-fecha_evento')
        campos_permitidos = {'fecha_evento', 'usuario', 'accion', 'pedido_id', 'id'}
        campos_ordenamiento = []

        for campo in ordering_param.split(','):
            campo = campo.strip()
            if not campo:
                continue
            campo_limpio = campo[1:] if campo.startswith('-') else campo
            if campo_limpio in campos_permitidos:
                campos_ordenamiento.append(campo)

        if not campos_ordenamiento:
            campos_ordenamiento = ['-fecha_evento', '-id']
        elif not any(campo.lstrip('-') == 'id' for campo in campos_ordenamiento):
            campos_ordenamiento.append('-id')

        queryset = queryset.order_by(*campos_ordenamiento)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = AuditoriaPedidoSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = AuditoriaPedidoSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



    # acciones personalizadas para confirmar y cancelar pedidos y manejar el stock en cada caso
    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        pedido = self.get_object()
        estado_anterior = pedido.estado

        if pedido.estado.nombre.lower() == 'recibido':
            return Response(
                {
                    'detalle': 'El pedido ya se encuentra confirmado.'
                },
                status=status.HTTP_200_OK,
            )

        if pedido.estado.nombre.lower() == 'cancelado':
            return Response(
                {
                    'detalle': 'No se puede confirmar un pedido cancelado.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        estado_recibido = EstadoPedido.objects.filter(nombre__iexact='recibido').first()
        if not estado_recibido:
            return Response(
                {
                    'detalle': 'No existe el estado recibido configurado.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        with transaction.atomic():
            pedido.estado = estado_recibido
            pedido.save(update_fields=['estado'])

            if request.user.is_staff and estado_anterior.id != estado_recibido.id:
                self._registrar_auditoria_estado(
                    pedido=pedido,
                    usuario=request.user,
                    estado_anterior=estado_anterior.nombre,
                    estado_nuevo=estado_recibido.nombre,
                )

            exito, mensaje = InventarioService.descontar_stock_pedido(pedido.id, usuario=request.user.username)
            if not exito:
                return Response(
                    {
                        'detalle': mensaje,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(
            {
                'detalle': 'Pedido confirmado correctamente.'
            },
            status=status.HTTP_200_OK,
        )




    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        pedido = self.get_object()
        estado_anterior = pedido.estado
    
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
        # Reintegrar el stock antes de cambiar el estado del pedido
        with transaction.atomic():
            pedido.estado = estado_cancelado
            pedido.save(update_fields=['estado'])

            if request.user.is_staff and estado_anterior.id != estado_cancelado.id:
                self._registrar_auditoria_estado(
                    pedido=pedido,
                    usuario=request.user,
                    estado_anterior=estado_anterior.nombre,
                    estado_nuevo=estado_cancelado.nombre,
                )

            exito, mensaje = InventarioService.reintegrar_stock_pedido(pedido.id, usuario=request.user.username)
            if not exito:
                return Response(
                    {
                        'detalle': mensaje,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(
            {
                'detalle': 'Pedido cancelado correctamente.'
            },
            status=status.HTTP_200_OK,
        )