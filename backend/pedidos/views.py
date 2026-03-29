from django.db import transaction
from rest_framework import filters, viewsets

from .models import AuditoriaPedido, DetallePedido, EstadoPedido, Pedido
from .serializers import (
	AuditoriaPedidoSerializer,
	DetallePedidoSerializer,
	EstadoPedidoSerializer,
	PedidoSerializer,
)


class EstadoPedidoViewSet(viewsets.ModelViewSet):
	queryset = EstadoPedido.objects.all().order_by("id")
	serializer_class = EstadoPedidoSerializer
	filter_backends = [filters.SearchFilter, filters.OrderingFilter]
	search_fields = ["nombre", "descripcion"]
	ordering_fields = ["id", "nombre"]


class PedidoViewSet(viewsets.ModelViewSet):
	queryset = (
		Pedido.objects.select_related("cliente", "empleado", "estado")
		.prefetch_related("detalles")
		.all()
		.order_by("-fecha_creacion")
	)
	serializer_class = PedidoSerializer
	filter_backends = [filters.SearchFilter, filters.OrderingFilter]
	search_fields = ["direccion_entrega", "cliente__username"]
	ordering_fields = ["id", "fecha_creacion", "total_pedido"]


class DetallePedidoViewSet(viewsets.ModelViewSet):
	queryset = DetallePedido.objects.select_related("pedido", "producto").all().order_by("id")
	serializer_class = DetallePedidoSerializer
	filter_backends = [filters.SearchFilter, filters.OrderingFilter]
	search_fields = ["producto__nombre", "pedido__id"]
	ordering_fields = ["id", "cantidad", "precio_unitario"]

	@transaction.atomic
	def perform_create(self, serializer):
		detalle = serializer.save()
		detalle.pedido.actualizar_total()

	@transaction.atomic
	def perform_update(self, serializer):
		detalle = serializer.save()
		detalle.pedido.actualizar_total()

	@transaction.atomic
	def perform_destroy(self, instance):
		pedido = instance.pedido
		instance.delete()
		pedido.actualizar_total()


class AuditoriaPedidoViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = AuditoriaPedido.objects.select_related("pedido").all().order_by("-fecha_evento")
	serializer_class = AuditoriaPedidoSerializer
	filter_backends = [filters.SearchFilter, filters.OrderingFilter]
	search_fields = ["usuario", "accion", "campo_modificado"]
	ordering_fields = ["id", "fecha_evento"]
