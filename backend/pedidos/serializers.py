from rest_framework import serializers
from datetime import timedelta

from .models import Pedido, DetallePedido, EstadoPedido
from usuarios.serializers import UsuarioRespuestaSerializer


class EstadoPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoPedido
        fields = '__all__'

class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = [
            'producto',
            'cantidad',
            'precio_unitario',
            'subtotal'
        ]


class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)
    estado = EstadoPedidoSerializer(read_only=True)
    cliente = UsuarioRespuestaSerializer(read_only=True)
    empleado = UsuarioRespuestaSerializer(read_only=True)
    class Meta:
        model = Pedido
        fields = '__all__'

class PedidoCreateSerializer(serializers.Serializer):
    cliente_id = serializers.IntegerField(read_only=True)
    direccion_entrega = serializers.CharField()
    total_pedido = serializers.DecimalField(max_digits=10, decimal_places=2)
    detalles = DetallePedidoSerializer(many=True)
    fecha_creacion = serializers.DateTimeField(read_only=True)
    fecha_limite_cancelacion = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        user = self.context['request'].user

        pedido = Pedido.objects.create(
            cliente_id=user.id,
            estado_id=1,  # pendiente
            direccion_entrega=validated_data['direccion_entrega'],
            total_pedido=validated_data['total_pedido']
        )

        pedido.fecha_limite_cancelacion = pedido.fecha_creacion + timedelta(minutes=5)
        pedido.save(update_fields=['fecha_limite_cancelacion'])

        detalles = [
            DetallePedido(
                pedido=pedido,
                producto=item['producto'],
                cantidad=item['cantidad'],
                precio_unitario=item['precio_unitario'],
                subtotal=item['subtotal']
            )
            for item in detalles_data
        ]

        DetallePedido.objects.bulk_create(detalles)

        return pedido