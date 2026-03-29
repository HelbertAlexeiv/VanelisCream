from decimal import Decimal

from rest_framework import serializers

from .models import AuditoriaPedido, DetallePedido, EstadoPedido, Pedido


class EstadoPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoPedido
        fields = ["id", "nombre", "descripcion"]


class DetallePedidoSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = DetallePedido
        fields = ["id", "pedido", "producto", "cantidad", "precio_unitario", "subtotal"]


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = [
            "id",
            "cliente",
            "empleado",
            "estado",
            "fecha_creacion",
            "direccion_entrega",
            "total_pedido",
            "detalles",
        ]
        read_only_fields = ["fecha_creacion", "total_pedido", "detalles"]

    def create(self, validated_data):
        pedido = Pedido.objects.create(total_pedido=Decimal("0.00"), **validated_data)
        pedido.actualizar_total()
        return pedido


class AuditoriaPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditoriaPedido
        fields = [
            "id",
            "pedido",
            "usuario",
            "accion",
            "campo_modificado",
            "valor_anterior",
            "valor_nuevo",
            "fecha_evento",
        ]
        read_only_fields = ["fecha_evento"]
